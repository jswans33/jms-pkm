import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationConfigModule } from './config/config.module';

@Module({
  imports: [ApplicationConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
