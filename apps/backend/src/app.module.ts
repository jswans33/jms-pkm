import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { StrategiesModule } from './shared/infrastructure/strategies/strategies.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ApplicationConfigModule,
    HealthModule,
    PrismaModule,
    StrategiesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
