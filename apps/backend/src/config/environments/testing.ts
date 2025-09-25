import {
  DATABASE_DEFAULT_PORT,
  DEFAULT_API_PREFIX,
  DEFAULT_LOG_FORMAT,
  REDIS_DEFAULT_PORT,
  TEST_APP_PORT,
} from '../constants';
import type { ConfigurationOverrides } from '../interfaces/configuration.interface';

export const testingEnvironment: ConfigurationOverrides = {
  app: {
    port: TEST_APP_PORT,
    apiPrefix: DEFAULT_API_PREFIX,
    corsOrigins: ['http://localhost:3000'],
    logLevel: 'warn',
    logFormat: DEFAULT_LOG_FORMAT,
  },
  database: {
    host: 'localhost',
    port: DATABASE_DEFAULT_PORT,
    username: 'postgres',
    password: 'postgres',
    name: 'ukp_testing',
  },
  redis: {
    host: 'localhost',
    port: REDIS_DEFAULT_PORT,
    password: '',
  },
};
