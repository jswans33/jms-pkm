import type { ConfigurationOverrides } from '../interfaces/configuration.interface';

import { devContainerEnvironment } from './dev-container';
import { developmentEnvironment } from './development';
import { productionEnvironment } from './production';
import { stagingEnvironment } from './staging';
import { testingEnvironment } from './testing';

export const ENVIRONMENTS = [
  'development',
  'dev-container',
  'testing',
  'staging',
  'production',
] as const;

export type Environment = (typeof ENVIRONMENTS)[number];

const environmentOverrides: Record<Environment, ConfigurationOverrides> = {
  development: developmentEnvironment,
  ['dev-container']: devContainerEnvironment,
  testing: testingEnvironment,
  staging: stagingEnvironment,
  production: productionEnvironment,
};

export const DEFAULT_ENVIRONMENT: Environment = 'development';

export const resolveEnvironment = (value: string | undefined): Environment => {
  if (value && (ENVIRONMENTS as readonly string[]).includes(value)) {
    return value as Environment;
  }

  return DEFAULT_ENVIRONMENT;
};

export const getEnvironmentOverrides = (environment: Environment): ConfigurationOverrides =>
  environmentOverrides[environment];

export const getEnvFilePaths = (environment: Environment): ReadonlyArray<string> => [
  `.env.${environment}.local`,
  `.env.${environment}`,
  '.env.local',
  '.env',
];
