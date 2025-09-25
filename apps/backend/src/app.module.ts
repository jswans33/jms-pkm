import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [ApplicationConfigModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
