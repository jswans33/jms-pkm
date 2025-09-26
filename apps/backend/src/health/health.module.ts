import { Module } from '@nestjs/common';

import { ApplicationConfigModule } from '../config/config.module';
import { DatabaseHealthService } from '../shared/infrastructure/database/database-health.service';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HEALTH_TCP_PROBE } from './health.tokens';
import { createTcpProbe } from './tcp-probe.factory';

@Module({
  imports: [ApplicationConfigModule, PrismaModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthService,
    {
      provide: HEALTH_TCP_PROBE,
      useFactory: createTcpProbe,
    },
  ],
  exports: [HealthService, DatabaseHealthService],
})
export class HealthModule {}
