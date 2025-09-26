import { Injectable } from '@nestjs/common';

import { ApplicationConfigService } from '../../../config/config.service';
import type {
  AuditProvider,
  IAuditTrailStrategy,
} from '../../application/strategies/audit-trail-strategy.interface';

import { ConsoleAuditStrategy } from './audit/console-audit.strategy';
import { DatabaseAuditStrategy } from './audit/database-audit.strategy';

@Injectable()
export class AuditStrategyResolver {
  private readonly strategies = new Map<AuditProvider, IAuditTrailStrategy>();
  private activeStrategy: IAuditTrailStrategy;

  public constructor(
    private readonly config: ApplicationConfigService,
    consoleAuditStrategy: ConsoleAuditStrategy,
    databaseAuditStrategy: DatabaseAuditStrategy,
  ) {
    this.strategies.set('console', consoleAuditStrategy);
    this.strategies.set('database', databaseAuditStrategy);

    // Use console strategy until database schema is ready
    // When AuditLog model is added to Prisma schema, change this to:
    // const selectedProvider = this.config.isProduction() ? 'database' : 'console';
    const selectedProvider: AuditProvider = 'console';
    const strategy = this.strategies.get(selectedProvider);

    if (!strategy) {
      throw new Error(`Audit strategy not found for provider: ${selectedProvider}`);
    }

    this.activeStrategy = strategy;
  }

  public resolve(provider: AuditProvider): IAuditTrailStrategy {
    const strategy = this.strategies.get(provider);

    if (!strategy) {
      throw new Error(`Audit strategy not found for provider: ${provider}`);
    }

    return strategy;
  }

  public getActive(): IAuditTrailStrategy {
    return this.activeStrategy;
  }

  public setActive(provider: AuditProvider): void {
    const strategy = this.resolve(provider);
    this.activeStrategy = strategy;
  }

  public getAvailableProviders(): ReadonlyArray<AuditProvider> {
    return Array.from(this.strategies.keys());
  }
}