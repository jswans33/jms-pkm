import {
  DATABASE_DEFAULT_PORT,
  DEFAULT_API_PREFIX,
  PRODUCTION_APP_PORT,
  REDIS_DEFAULT_PORT,
} from '../constants';
import type { ConfigurationOverrides } from '../interfaces/configuration.interface';

export const productionEnvironment: ConfigurationOverrides = {
  app: {
    port: PRODUCTION_APP_PORT,
    apiPrefix: DEFAULT_API_PREFIX,
    corsOrigins: [],
    logLevel: 'warn',
    logFormat: 'json',
  },
  database: {
    host: 'production-db',
    port: DATABASE_DEFAULT_PORT,
    username: 'ukp',
    password: 'production-password',
    name: 'ukp_production',
  },
  redis: {
    host: 'production-redis',
    port: REDIS_DEFAULT_PORT,
    password: 'production-redis-password',
  },
};
