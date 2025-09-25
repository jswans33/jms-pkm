import { configuration } from './configuration';
import {
  DEFAULT_API_PREFIX,
  DEFAULT_JWT_SECRET,
  DEFAULT_SESSION_SECRET,
  DEVELOPMENT_APP_PORT,
  REDIS_DEFAULT_PORT,
  STAGING_APP_PORT,
} from './constants';

const ENV_KEYS = [
  'NODE_ENV',
  'PORT',
  'API_PREFIX',
  'CORS_ORIGINS',
  'LOG_LEVEL',
  'LOG_FORMAT',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'JWT_SECRET',
  'SESSION_SECRET',
  'API_KEY',
] as const;

describe('configuration', () => {
  const originalEnv = { ...process.env };

  const resetEnv = (): void => {
    ENV_KEYS.forEach((key) => {
      delete process.env[key];
    });
  };

  beforeEach(() => {
    resetEnv();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns development defaults when no overrides are supplied', () => {
    const result = configuration();

    expect(result.app.environment).toBe('development');
    expect(result.app.port).toBe(DEVELOPMENT_APP_PORT);
    expect(result.app.apiPrefix).toBe(DEFAULT_API_PREFIX);
    expect(result.database.host).toBe('localhost');
    expect(result.redis.port).toBe(REDIS_DEFAULT_PORT);
    expect(result.security.jwtSecret).toBe(DEFAULT_JWT_SECRET);
    expect(result.security.sessionSecret).toBe(DEFAULT_SESSION_SECRET);
  });

  it('applies staging environment overrides by default when NODE_ENV=staging', () => {
    process.env['NODE_ENV'] = 'staging';

    const result = configuration();

    expect(result.app.environment).toBe('staging');
    expect(result.app.port).toBe(STAGING_APP_PORT);
    expect(result.app.logFormat).toBe('json');
    expect(result.database.host).toBe('staging-db');
    expect(result.redis.host).toBe('staging-redis');
  });

  it('honours runtime overrides and sanitises the API prefix', () => {
    process.env['NODE_ENV'] = 'development';
    process.env['PORT'] = '4321';
    process.env['API_PREFIX'] = '/v2/';
    process.env['CORS_ORIGINS'] = 'http://a.test , http://b.test ,';
    process.env['DB_URL'] = 'postgres://user:pass@host:5432/db';
    process.env['API_KEY'] = 'override-api-key';

    const result = configuration();

    expect(result.app.port).toBe(4321);
    expect(result.app.apiPrefix).toBe('v2');
    expect(result.app.corsOrigins).toEqual(['http://a.test', 'http://b.test']);
    expect(result.database).toHaveProperty('url', 'postgres://user:pass@host:5432/db');
    expect(result.security).toHaveProperty('apiKey', 'override-api-key');
  });

  it('falls back to default environment when NODE_ENV is unknown', () => {
    process.env['NODE_ENV'] = 'non-existent';

    const result = configuration();

    expect(result.app.environment).toBe('development');
  });
});
