import Joi from 'joi';

import {
  DATABASE_DEFAULT_PORT,
  DEFAULT_API_PREFIX,
  DEFAULT_JWT_SECRET,
  DEFAULT_LOG_FORMAT,
  DEFAULT_LOG_LEVEL,
  DEFAULT_SESSION_SECRET,
  PORT_MAX,
  PORT_MIN,
  SECRET_MIN_LENGTH,
  REDIS_DEFAULT_PORT,
} from './constants';
import { ENVIRONMENTS } from './environments';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...ENVIRONMENTS)
    .default('development'),
  PORT: Joi.number().integer().min(PORT_MIN).max(PORT_MAX),
  API_PREFIX: Joi.string().allow('').default(DEFAULT_API_PREFIX),
  CORS_ORIGINS: Joi.string().allow(''),
  LOG_LEVEL: Joi.string().default(DEFAULT_LOG_LEVEL),
  LOG_FORMAT: Joi.string().valid('json', 'pretty').default(DEFAULT_LOG_FORMAT),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().integer().min(PORT_MIN).max(PORT_MAX).default(DATABASE_DEFAULT_PORT),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().allow('').default('postgres'),
  DB_NAME: Joi.string().default('ukp'),
  DB_URL: Joi.string().uri().optional(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().integer().min(PORT_MIN).max(PORT_MAX).default(REDIS_DEFAULT_PORT),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  JWT_SECRET: Joi.string().min(SECRET_MIN_LENGTH).default(DEFAULT_JWT_SECRET),
  SESSION_SECRET: Joi.string().min(SECRET_MIN_LENGTH).default(DEFAULT_SESSION_SECRET),
  API_KEY: Joi.string().allow(''),
});
