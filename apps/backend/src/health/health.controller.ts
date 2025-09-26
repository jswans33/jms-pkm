import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';

type HealthResponse = Readonly<{ status: 'ok' }>;

@Controller('health')
export class HealthController {
  // NestJS DI requires the concrete service type.
   
  public constructor(private readonly healthService: HealthService) {}

  @Get('config')
  public async getConfigurationHealth(): Promise<HealthResponse> {
    await this.healthService.assertDependenciesHealthy();
    return { status: 'ok' };
  }

  @Get('detailed')
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
    return this.healthService.getDetailedHealth();
  }
}
