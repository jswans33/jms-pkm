import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApplicationConfigService } from './config.service';
import { configuration } from './configuration';
import { getEnvFilePaths, resolveEnvironment } from './environments';
import { validationSchema } from './validation.schema';

const environment = resolveEnvironment(process.env['NODE_ENV']);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      envFilePath: [...getEnvFilePaths(environment)],
      validationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  providers: [ApplicationConfigService],
  exports: [ApplicationConfigService],
})
export class ApplicationConfigModule {}
