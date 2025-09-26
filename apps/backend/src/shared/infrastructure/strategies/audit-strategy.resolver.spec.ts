import type { ApplicationConfigService } from '../../../config/config.service';
import type {
  AuditProvider,
  IAuditEvent,
  IAuditQuery,
  IAuditTrailStrategy,
} from '../../application/strategies/audit-trail-strategy.interface';

import { ConsoleAuditStrategy } from './audit/console-audit.strategy';
import { DatabaseAuditStrategy } from './audit/database-audit.strategy';
import { AuditStrategyResolver } from './audit-strategy.resolver';

class StubAuditStrategy implements IAuditTrailStrategy {
  public constructor(public readonly name: AuditProvider) {}

  public async log(event: IAuditEvent): Promise<void> {
    await Promise.resolve(event);
  }

  public async query(params: IAuditQuery): Promise<ReadonlyArray<IAuditEvent>> {
    await Promise.resolve(params);
    return [];
  }

  public async purge(beforeDate: Date): Promise<number> {
    await Promise.resolve(beforeDate);
    return 0;
  }
}

const createConfig = (isProd: boolean): ApplicationConfigService =>
  ({
    isProduction: jest.fn().mockReturnValue(isProd),
  } as unknown as ApplicationConfigService);

describe('AuditStrategyResolver', () => {
  it('defaults to console strategy outside production', () => {
    const consoleStrategy = new StubAuditStrategy('console');
    const databaseStrategy = new StubAuditStrategy('database');
    const resolver = new AuditStrategyResolver(
      createConfig(false),
      consoleStrategy as unknown as ConsoleAuditStrategy,
      databaseStrategy as unknown as DatabaseAuditStrategy,
    );

    expect(resolver.getActive()).toBe(consoleStrategy);
    expect(resolver.getAvailableProviders()).toEqual(['console', 'database']);
  });

  it('falls back to console strategy in production until database audit is ready', () => {
    const consoleStrategy = new StubAuditStrategy('console');
    const databaseStrategy = new StubAuditStrategy('database');
    const resolver = new AuditStrategyResolver(
      createConfig(true),
      consoleStrategy as unknown as ConsoleAuditStrategy,
      databaseStrategy as unknown as DatabaseAuditStrategy,
    );

    expect(resolver.getActive()).toBe(consoleStrategy);
  });

  it('switches active strategy and resolves providers', () => {
    const consoleStrategy = new StubAuditStrategy('console');
    const databaseStrategy = new StubAuditStrategy('database');
    const resolver = new AuditStrategyResolver(
      createConfig(false),
      consoleStrategy as unknown as ConsoleAuditStrategy,
      databaseStrategy as unknown as DatabaseAuditStrategy,
    );

    resolver.setActive('database');
    expect(resolver.getActive()).toBe(databaseStrategy);
    expect(resolver.resolve('console')).toBe(consoleStrategy);
    expect(() => resolver.resolve('elasticsearch')).toThrow(
      'Audit strategy not found for provider: elasticsearch',
    );
  });

  it('throws when activating an unknown provider', () => {
    const consoleStrategy = new StubAuditStrategy('console');
    const databaseStrategy = new StubAuditStrategy('database');
    const resolver = new AuditStrategyResolver(
      createConfig(false),
      consoleStrategy as unknown as ConsoleAuditStrategy,
      databaseStrategy as unknown as DatabaseAuditStrategy,
    );

    expect(() => resolver.setActive('elasticsearch')).toThrow(
      'Audit strategy not found for provider: elasticsearch',
    );
  });
});
