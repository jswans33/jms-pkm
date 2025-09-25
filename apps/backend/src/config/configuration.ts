import {
  DATABASE_DEFAULT_PORT,
  DEFAULT_API_PREFIX,
  DEFAULT_APP_NAME,
  DEFAULT_JWT_SECRET,
  DEFAULT_LOG_FORMAT,
  DEFAULT_LOG_LEVEL,
  DEFAULT_SESSION_SECRET,
  DEVELOPMENT_APP_PORT,
  PORT_MAX,
  PORT_MIN,
  REDIS_DEFAULT_PORT,
} from './constants';
import { getEnvironmentOverrides, resolveEnvironment } from './environments';
import type { Environment } from './environments';
import type { IAppConfig } from './interfaces/app.config';
import type {
  ConfigurationOverrides,
  IConfiguration,
} from './interfaces/configuration.interface';
import type { IDatabaseConfig } from './interfaces/database.config';
import type { IRedisConfig } from './interfaces/redis.config';
import type { ISecurityConfig } from './interfaces/security.config';

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  if (parsed < PORT_MIN || parsed > PORT_MAX) {
    return fallback;
  }

  return parsed;
};

const parseOrigins = (
  value: string | undefined,
  fallback: ReadonlyArray<string> | undefined,
): ReadonlyArray<string> => {
  if (value === undefined) {
    return fallback ?? [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
};

const sanitizePrefix = (value: string): string => value.replace(/^\/+|\/+$/g, '');

const resolveNumber = (
  envValue: string | undefined,
  overrideValue: number | undefined,
  fallback: number,
): number => parseNumber(envValue, overrideValue ?? fallback);

const resolveString = (
  envValue: string | undefined,
  overrideValue: string | undefined,
  fallback: string,
): string => envValue ?? overrideValue ?? fallback;

const resolveOptionalString = (
  envValue: string | undefined,
  overrideValue: string | undefined,
): string | undefined => envValue ?? overrideValue;

const buildAppConfig = (
  environment: Environment,
  overrides: ConfigurationOverrides,
): IAppConfig => {
  const appOverrides = overrides.app ?? {};

  return {
    name: DEFAULT_APP_NAME,
    environment,
    port: resolveNumber(process.env['PORT'], appOverrides.port, DEVELOPMENT_APP_PORT),
    apiPrefix: sanitizePrefix(
      resolveString(process.env['API_PREFIX'], appOverrides.apiPrefix, DEFAULT_API_PREFIX),
    ),
    corsOrigins: parseOrigins(process.env['CORS_ORIGINS'], appOverrides.corsOrigins),
    logLevel: resolveString(process.env['LOG_LEVEL'], appOverrides.logLevel, DEFAULT_LOG_LEVEL),
    logFormat: resolveString(
      process.env['LOG_FORMAT'],
      appOverrides.logFormat,
      DEFAULT_LOG_FORMAT,
    ) as IAppConfig['logFormat'],
  };
};

const buildDatabaseConfig = (overrides: ConfigurationOverrides): IDatabaseConfig => {
  const databaseOverrides = overrides.database ?? {};
  const url = resolveOptionalString(process.env['DB_URL'], databaseOverrides.url);

  return {
    host: resolveString(process.env['DB_HOST'], databaseOverrides.host, 'localhost'),
    port: resolveNumber(process.env['DB_PORT'], databaseOverrides.port, DATABASE_DEFAULT_PORT),
    username: resolveString(process.env['DB_USERNAME'], databaseOverrides.username, 'postgres'),
    password: resolveString(process.env['DB_PASSWORD'], databaseOverrides.password, 'postgres'),
    name: resolveString(process.env['DB_NAME'], databaseOverrides.name, 'ukp'),
    ...(url === undefined ? {} : { url }),
  };
};

const buildRedisConfig = (overrides: ConfigurationOverrides): IRedisConfig => {
  const redisOverrides = overrides.redis ?? {};

  return {
    host: resolveString(process.env['REDIS_HOST'], redisOverrides.host, 'localhost'),
    port: resolveNumber(process.env['REDIS_PORT'], redisOverrides.port, REDIS_DEFAULT_PORT),
    password: resolveString(process.env['REDIS_PASSWORD'], redisOverrides.password, ''),
  };
};

const buildSecurityConfig = (overrides: ConfigurationOverrides): ISecurityConfig => {
  const securityOverrides = overrides.security ?? {};

  const apiKey = resolveOptionalString(process.env['API_KEY'], securityOverrides.apiKey);

  return {
    jwtSecret: resolveString(
      process.env['JWT_SECRET'],
      securityOverrides.jwtSecret,
      DEFAULT_JWT_SECRET,
    ),
    sessionSecret: resolveString(
      process.env['SESSION_SECRET'],
      securityOverrides.sessionSecret,
      DEFAULT_SESSION_SECRET,
    ),
    ...(apiKey === undefined ? {} : { apiKey }),
  };
};

export const configuration = (): IConfiguration => {
  const environment: Environment = resolveEnvironment(process.env['NODE_ENV']);
  const overrides = getEnvironmentOverrides(environment);

  return {
    app: buildAppConfig(environment, overrides),
    database: buildDatabaseConfig(overrides),
    redis: buildRedisConfig(overrides),
    security: buildSecurityConfig(overrides),
  };
};
