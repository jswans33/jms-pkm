import { Module } from '@nestjs/common';

import { ApplicationConfigModule } from '../config/config.module';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HEALTH_TCP_PROBE } from './health.tokens';
import { createTcpProbe } from './tcp-probe.factory';

@Module({
  imports: [ApplicationConfigModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    {
      provide: HEALTH_TCP_PROBE,
      useFactory: createTcpProbe,
    },
  ],
  exports: [HealthService],
})
export class HealthModule {}
