import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import { ApplicationConfigService } from '../config/config.service';
import { DatabaseHealthService } from '../shared/infrastructure/database/database-health.service';

import { DEFAULT_HEALTH_TIMEOUT_MS, HEALTH_TCP_PROBE, type TcpProbe } from './health.tokens';

interface IDependencyTarget {
  readonly name: string;
  readonly host: string;
  readonly port: number;
}

type ApplicationConfigReader = Readonly<
  Pick<ApplicationConfigService, 'app' | 'database' | 'redis'>
>;

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  public constructor(
    @Inject(ApplicationConfigService)
    private readonly config: ApplicationConfigReader,
    @Inject(HEALTH_TCP_PROBE) private readonly tcpProbe: TcpProbe,
    private readonly databaseHealth: DatabaseHealthService,
  ) {}

  public async assertDependenciesHealthy(): Promise<void> {
    const dependencies = this.collectDependencies();
    const results = await Promise.allSettled([
      ...dependencies.map(async (dependency) => this.checkDependency(dependency)),
      this.checkDatabaseHealth(),
    ]);

    const failedDependencies: string[] = [];

    for (const [index, result] of results.entries()) {
      if (result?.status === 'rejected') {
        if (index < dependencies.length) {
          failedDependencies.push(dependencies[index]!.name);
        } else {
          failedDependencies.push('database_migrations');
        }
      }
    }

    if (failedDependencies.length > 0) {
      throw new ServiceUnavailableException(
        `Unhealthy dependencies: ${failedDependencies.join(', ')}`,
      );
    }
  }

  public async getDetailedHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    dependencies: Record<string, { status: string; latency?: number; error?: string }>;
    database: {
      connected: boolean;
      migrationsApplied: boolean;
      latency?: number;
      error?: string;
    };
  }> {
    const dependencyResults = await this.checkAllDependencies();
    const databaseResult = await this.getDatabaseHealthStatus();
    const status = this.calculateOverallStatus(dependencyResults, databaseResult);

    return {
      status,
      dependencies: dependencyResults,
      database: databaseResult,
    };
  }

  private async checkAllDependencies(): Promise<
    Record<string, { status: string; latency?: number; error?: string }>
  > {
    const dependencies = this.collectDependencies();
    const results: Record<string, { status: string; latency?: number; error?: string }> = {};

    for (const dependency of dependencies) {
      try {
        const startTime = Date.now();
        await this.checkDependency(dependency);
        results[dependency.name] = {
          status: 'healthy',
          latency: Date.now() - startTime,
        };
      } catch (error) {
        results[dependency.name] = {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return results;
  }

  private async getDatabaseHealthStatus(): Promise<{
    connected: boolean;
    migrationsApplied: boolean;
    latency?: number;
    error?: string;
  }> {
    try {
      const health = await this.databaseHealth.checkHealth();
      return {
        connected: health.isConnected,
        migrationsApplied: health.migrationsApplied,
        ...(health.latencyMs !== undefined && { latency: health.latencyMs }),
        ...(health.error !== undefined && { error: health.error }),
      };
    } catch (error) {
      return {
        connected: false,
        migrationsApplied: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private calculateOverallStatus(
    dependencyResults: Record<string, { status: string }>,
    databaseResult: { connected: boolean; migrationsApplied: boolean },
  ): 'healthy' | 'degraded' | 'unhealthy' {
    const hasUnhealthyDependencies = Object.values(dependencyResults).some(
      (dep) => dep.status === 'unhealthy',
    );
    const isDatabaseUnhealthy = !databaseResult.connected || !databaseResult.migrationsApplied;

    return hasUnhealthyDependencies || isDatabaseUnhealthy ? 'unhealthy' : 'healthy';
  }

  private collectDependencies(): ReadonlyArray<IDependencyTarget> {
    return [
      {
        name: 'database',
        host: this.config.database.host,
        port: this.config.database.port,
      },
      {
        name: 'redis',
        host: this.config.redis.host,
        port: this.config.redis.port,
      },
    ] as const;
  }

  private async checkDependency({ name, host, port }: Readonly<IDependencyTarget>): Promise<void> {
    try {
      await this.tcpProbe({ host, port, label: name, timeoutMs: DEFAULT_HEALTH_TIMEOUT_MS });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Dependency '${name}' check failed: ${message}`);
      throw error;
    }
  }

  private async checkDatabaseHealth(): Promise<void> {
    try {
      await this.databaseHealth.ensureDatabaseReady();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Database health check failed: ${message}`);
      throw error;
    }
  }
}
