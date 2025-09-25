import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

type HealthResponse = Readonly<{ status: 'ok' }>;

@Controller()
export class AppController {
  // NestJS DI requires the concrete type here; readonly contract is enforced via the field modifier.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly appService: AppService) {}

  @Get()
  public getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/config')
  public getConfigurationHealth(): HealthResponse {
    return { status: 'ok' };
  }
}
