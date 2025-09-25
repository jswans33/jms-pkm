import {
  DATABASE_DEFAULT_PORT,
  DEFAULT_API_PREFIX,
  DEFAULT_LOG_FORMAT,
  DEV_CONTAINER_APP_PORT,
  REDIS_DEFAULT_PORT,
} from '../constants';
import type { ConfigurationOverrides } from '../interfaces/configuration.interface';

export const devContainerEnvironment: ConfigurationOverrides = {
  app: {
    port: DEV_CONTAINER_APP_PORT,
    apiPrefix: DEFAULT_API_PREFIX,
    corsOrigins: ['http://localhost:3000'],
    logLevel: 'debug',
    logFormat: DEFAULT_LOG_FORMAT,
  },
  database: {
    host: 'postgres',
    port: DATABASE_DEFAULT_PORT,
    username: 'postgres',
    password: 'postgres',
    name: 'ukp_dev_container',
  },
  redis: {
    host: 'redis',
    port: REDIS_DEFAULT_PORT,
    password: '',
  },
};
