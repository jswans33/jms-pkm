import { ServiceUnavailableException } from '@nestjs/common';

import type { ApplicationConfigService } from '../config/config.service';
import type { IAppConfig } from '../config/interfaces/app.config';
import type { IDatabaseConfig } from '../config/interfaces/database.config';
import type { IRedisConfig } from '../config/interfaces/redis.config';
import type { ISecurityConfig } from '../config/interfaces/security.config';

import { HealthService } from './health.service';
import type { TcpProbe } from './health.tokens';

type ConfigServiceStub = Readonly<{
  readonly app: IAppConfig;
  readonly database: IDatabaseConfig;
  readonly redis: IRedisConfig;
  readonly security: ISecurityConfig;
}>;

const buildConfigService = (): ConfigServiceStub => {
  const app: IAppConfig = {
    name: 'test-app',
    environment: 'development',
    port: 3000,
    apiPrefix: 'api',
    corsOrigins: [],
    logLevel: 'debug',
    logFormat: 'pretty',
  };

  const database: IDatabaseConfig = {
    host: 'postgres',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    name: 'postgres',
  };

  const redis: IRedisConfig = {
    host: 'redis',
    port: 6379,
    password: '',
  };

  const security: ISecurityConfig = {
    jwtSecret: 'secret',
    sessionSecret: 'session',
  };

  return {
    app,
    database,
    redis,
    security,
  } as const;
};

describe('HealthService', () => {
  it('confirms dependencies when all probes succeed', async () => {
    const tcpProbe: TcpProbe = jest.fn().mockResolvedValue(undefined);
    const service = new HealthService(
      buildConfigService() as unknown as ApplicationConfigService,
      tcpProbe,
    );

    await expect(service.assertDependenciesHealthy()).resolves.toBeUndefined();
    expect(tcpProbe).toHaveBeenCalledTimes(2);
  });

  it('throws when a dependency probe fails', async () => {
    const tcpProbe: TcpProbe = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('redis unreachable'));
    const service = new HealthService(
      buildConfigService() as unknown as ApplicationConfigService,
      tcpProbe,
    );

    await expect(service.assertDependenciesHealthy()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
