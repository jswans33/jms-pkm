import { Socket } from 'node:net';

import { DEFAULT_HEALTH_TIMEOUT_MS, type ITcpProbeOptions, type TcpProbe } from './health.tokens';

const resolveTimeout = (timeoutMs: ITcpProbeOptions['timeoutMs']): number => {
  if (typeof timeoutMs === 'number' && Number.isFinite(timeoutMs) && timeoutMs > 0) {
    return timeoutMs;
  }

  return DEFAULT_HEALTH_TIMEOUT_MS;
};

export const createTcpProbe = (): TcpProbe =>
  async (options: Readonly<ITcpProbeOptions>): Promise<void> =>
    new Promise((resolve, reject) => {
      const socket = new Socket();
      const { host, port, timeoutMs } = options;
      const timeout = resolveTimeout(timeoutMs);

      const cleanup = (): void => {
        socket.removeAllListeners();
        socket.destroy();
        clearTimeout(timer);
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Connection to ${host}:${port} timed out after ${timeout}ms`));
      }, timeout);

      socket.once('error', (error: Readonly<Error>) => {
        cleanup();
        reject(error);
      });

      socket.connect(port, host, () => {
        cleanup();
        resolve();
      });
    });
