import {
  DATABASE_DEFAULT_PORT,
  DEFAULT_API_PREFIX,
  REDIS_DEFAULT_PORT,
  STAGING_APP_PORT,
} from '../constants';
import type { ConfigurationOverrides } from '../interfaces/configuration.interface';

export const stagingEnvironment: ConfigurationOverrides = {
  app: {
    port: STAGING_APP_PORT,
    apiPrefix: DEFAULT_API_PREFIX,
    corsOrigins: ['https://staging.example.com'],
    logLevel: 'info',
    logFormat: 'json',
  },
  database: {
    host: 'staging-db',
    port: DATABASE_DEFAULT_PORT,
    username: 'ukp',
    password: 'staging-password',
    name: 'ukp_staging',
  },
  redis: {
    host: 'staging-redis',
    port: REDIS_DEFAULT_PORT,
    password: 'staging-redis-password',
  },
};
