import { Controller, Get } from '@nestjs/common';

import { HealthService } from './health.service';

type HealthResponse = Readonly<{ status: 'ok' }>;

@Controller('health')
export class HealthController {
  // NestJS DI requires the concrete service type.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly healthService: HealthService) {}

  @Get('config')
  public async getConfigurationHealth(): Promise<HealthResponse> {
    await this.healthService.assertDependenciesHealthy();
    return { status: 'ok' };
  }
}
