import { ApplicationConfigService } from './config.service';
import type { Environment } from './environments';
import type { IConfiguration } from './interfaces/configuration.interface';

describe('ApplicationConfigService', () => {
  const baseConfiguration: IConfiguration = {
    app: {
      name: 'test-app',
      environment: 'development',
      port: 3000,
      apiPrefix: 'api',
      corsOrigins: [],
      logLevel: 'info',
      logFormat: 'json',
    },
    database: {
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      name: 'db',
    },
    redis: {
      host: 'localhost',
      port: 6379,
      password: 'password',
    },
    security: {
      jwtSecret: 'jwt-secret-value',
      sessionSecret: 'session-secret-value',
    },
  };

  const createService = (overrides?: Partial<IConfiguration>): ApplicationConfigService => {
    const merged: IConfiguration = {
      ...baseConfiguration,
      ...overrides,
      app: { ...baseConfiguration.app, ...overrides?.app },
      database: { ...baseConfiguration.database, ...overrides?.database },
      redis: { ...baseConfiguration.redis, ...overrides?.redis },
      security: { ...baseConfiguration.security, ...overrides?.security },
    };

    const getOrThrow = jest.fn(<K extends keyof IConfiguration>(key: K) => merged[key]);

    return new ApplicationConfigService({ getOrThrow });
  };

  it('exposes strongly typed configuration sections', () => {
    const service = createService();

    expect(service.app.name).toBe('test-app');
    expect(service.database.host).toBe('localhost');
    expect(service.redis.port).toBe(6379);
    expect(service.security.jwtSecret).toBe('jwt-secret-value');
  });

  it('reports production mode when the app environment is production', () => {
    const service = createService({
      app: {
        ...baseConfiguration.app,
        environment: 'production' as Environment,
      },
    });

    expect(service.isProduction()).toBe(true);
  });

  it('reports non-production for other environments', () => {
    const service = createService({
      app: {
        ...baseConfiguration.app,
        environment: 'testing' as Environment,
      },
    });

    expect(service.isProduction()).toBe(false);
  });
});
