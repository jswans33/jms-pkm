import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IAppConfig } from './interfaces/app.config';
import type { IConfiguration } from './interfaces/configuration.interface';
import type { IDatabaseConfig } from './interfaces/database.config';
import type { IRedisConfig } from './interfaces/redis.config';
import type { ISecurityConfig } from './interfaces/security.config';

type ConfigReader = Readonly<Pick<ConfigService<IConfiguration, true>, 'getOrThrow'>>;

@Injectable()
export class ApplicationConfigService {
  public constructor(
    private readonly configService: ConfigReader,
  ) {}

  public get app(): IAppConfig {
    return this.configService.getOrThrow('app');
  }

  public get database(): IDatabaseConfig {
    return this.configService.getOrThrow('database');
  }

  public get redis(): IRedisConfig {
    return this.configService.getOrThrow('redis');
  }

  public get security(): ISecurityConfig {
    return this.configService.getOrThrow('security');
  }

  public isProduction(): boolean {
    return this.app.environment === 'production';
  }
}
