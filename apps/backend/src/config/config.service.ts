import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IAppConfig } from './interfaces/app.config';
import type { IConfiguration } from './interfaces/configuration.interface';
import type { IDatabaseConfig } from './interfaces/database.config';
import type { IRedisConfig } from './interfaces/redis.config';
import type { ISecurityConfig } from './interfaces/security.config';

interface IReadonlyConfigService {
  readonly getOrThrow: <K extends keyof IConfiguration>(key: K) => IConfiguration[K];
}

type ConfigReader = Readonly<Pick<ConfigService<IConfiguration, true>, 'getOrThrow'>>;

@Injectable()
export class ApplicationConfigService {
  private readonly configReader: ConfigReader;

  public constructor(
    @Inject(ConfigService)
    configService: IReadonlyConfigService,
  ) {
    this.configReader = configService;
  }

  public get app(): IAppConfig {
    return this.configReader.getOrThrow('app');
  }

  public get database(): IDatabaseConfig {
    return this.configReader.getOrThrow('database');
  }

  public get redis(): IRedisConfig {
    return this.configReader.getOrThrow('redis');
  }

  public get security(): ISecurityConfig {
    return this.configReader.getOrThrow('security');
  }

  public isProduction(): boolean {
    return this.app.environment === 'production';
  }

  public getDatabaseUrl(): string {
    const db = this.database;
    if (db.url) {
      return db.url;
    }
    return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}?schema=public`;
  }
}
