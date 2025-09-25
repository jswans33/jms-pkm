import type { IAppConfig } from './app.config';
import type { IDatabaseConfig } from './database.config';
import type { IRedisConfig } from './redis.config';
import type { ISecurityConfig } from './security.config';

export interface IConfiguration {
  readonly app: IAppConfig;
  readonly database: IDatabaseConfig;
  readonly redis: IRedisConfig;
  readonly security: ISecurityConfig;
}

export type ConfigurationOverrides = Partial<{
  readonly app: Partial<IAppConfig>;
  readonly database: Partial<IDatabaseConfig>;
  readonly redis: Partial<IRedisConfig>;
  readonly security: Partial<ISecurityConfig>;
}>;
