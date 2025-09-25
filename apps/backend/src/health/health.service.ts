import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import { ApplicationConfigService } from '../config/config.service';

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
  ) {}

  public async assertDependenciesHealthy(): Promise<void> {
    const dependencies = this.collectDependencies();
    const results = await Promise.allSettled(
      dependencies.map(async (dependency) => this.checkDependency(dependency)),
    );

    const failedDependencies: string[] = [];

    for (const [index, result] of results.entries()) {
      if (result?.status === 'rejected') {
        failedDependencies.push(dependencies[index]!.name);
      }
    }

    if (failedDependencies.length > 0) {
      throw new ServiceUnavailableException(
        `Unhealthy dependencies: ${failedDependencies.join(', ')}`,
      );
    }
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
}
