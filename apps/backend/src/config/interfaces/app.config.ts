import type { Environment } from '../environments';

export type LogFormat = 'json' | 'pretty';

export interface IAppConfig {
  readonly name: string;
  readonly environment: Environment;
  readonly port: number;
  readonly apiPrefix: string;
  readonly corsOrigins: ReadonlyArray<string>;
  readonly logLevel: string;
  readonly logFormat: LogFormat;
}
