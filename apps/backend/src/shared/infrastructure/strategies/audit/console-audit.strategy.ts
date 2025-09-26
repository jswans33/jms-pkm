import { Injectable, Logger } from '@nestjs/common';

import type {
  IAuditEvent,
  IAuditQuery,
  IAuditTrailStrategy,
} from '../../../application/strategies/audit-trail-strategy.interface';

@Injectable()
export class ConsoleAuditStrategy implements IAuditTrailStrategy {
  public readonly name = 'console';
  private readonly logger = new Logger('AuditTrail');

  public async log(event: IAuditEvent): Promise<void> {
    const logMessage = this.formatEvent(event);

    if (event.result === 'failure') {
      this.logger.error(logMessage);
    } else {
      this.logger.log(logMessage);
    }
  }

  public async query(params: IAuditQuery): Promise<ReadonlyArray<IAuditEvent>> {
    // Console strategy doesn't support querying
    this.logger.warn(`Query attempted on console audit strategy: ${JSON.stringify(params)}`);
    return [];
  }

  public async purge(beforeDate: Date): Promise<number> {
    // Console strategy doesn't support purging
    this.logger.warn(`Purge attempted on console audit strategy before: ${beforeDate.toISOString()}`);
    return 0;
  }

  private formatEvent(event: IAuditEvent): string {
    const parts = [
      `[${event.result.toUpperCase()}]`,
      `Action: ${event.action}`,
      `Resource: ${event.resource}`,
    ];

    if (event.resourceId) {
      parts.push(`ID: ${event.resourceId}`);
    }

    if (event.userId) {
      parts.push(`User: ${event.userId}`);
    }

    if (event.errorMessage) {
      parts.push(`Error: ${event.errorMessage}`);
    }

    if (event.metadata) {
      parts.push(`Metadata: ${JSON.stringify(event.metadata)}`);
    }

    return parts.join(' | ');
  }
}