export interface ITcpProbeOptions {
  readonly host: string;
  readonly port: number;
  readonly timeoutMs?: number;
  readonly label?: string;
}

export type TcpProbe = (options: Readonly<ITcpProbeOptions>) => Promise<void>;

export const HEALTH_TCP_PROBE = Symbol('HEALTH_TCP_PROBE');

export const DEFAULT_HEALTH_TIMEOUT_MS = 1_000;
