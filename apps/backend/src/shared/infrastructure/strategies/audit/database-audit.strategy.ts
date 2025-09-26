import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type {
  IAuditEvent,
  IAuditQuery,
  IAuditTrailStrategy,
} from '../../../application/strategies/audit-trail-strategy.interface';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DatabaseAuditStrategy implements IAuditTrailStrategy {
  public readonly name = 'database';

  // We'll use Prisma when AuditLog model is added to schema
  public constructor(private readonly prisma: PrismaService) {
    void this.prisma;
  }

  public async log(event: IAuditEvent): Promise<void> {
    // When Prisma schema includes AuditLog model, uncomment this:
    /*
    await this.prisma['auditLog'].create({
      data: {
        id: event.id ?? randomUUID(),
        timestamp: event.timestamp,
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        result: event.result,
        errorMessage: event.errorMessage,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      },
    });
    */

    // Temporary implementation until AuditLog model exists
    const eventWithId = { ...event, id: event.id ?? randomUUID() };
    await Promise.resolve(eventWithId);
  }

  public async query(params: IAuditQuery): Promise<ReadonlyArray<IAuditEvent>> {
    // When Prisma schema includes AuditLog model, implement query logic
    /*
    const logs = await this.prisma['auditLog'].findMany({
      where: {
        ...(params.userId && { userId: params.userId }),
        ...(params.action && { action: params.action }),
        ...(params.resource && { resource: params.resource }),
        ...(params.startDate && { timestamp: { gte: params.startDate } }),
        ...(params.endDate && { timestamp: { lte: params.endDate } }),
      },
      take: params.limit ?? 100,
      skip: params.offset ?? 0,
      orderBy: { timestamp: 'desc' },
    });

    return logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : undefined,
    }));
    */

    // Temporary implementation
    await Promise.resolve(params);
    return [];
  }

  public async purge(beforeDate: Date): Promise<number> {
    // When Prisma schema includes AuditLog model, implement purge logic
    /*
    const result = await this.prisma['auditLog'].deleteMany({
      where: {
        timestamp: { lt: beforeDate },
      },
    });
    return result.count;
    */

    // Temporary implementation
    await Promise.resolve(beforeDate);
    return 0;
  }
}