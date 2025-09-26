import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import type { PrismaService } from './prisma.service';

type TransactionHandler<TResult> = (tx: Prisma.TransactionClient) => Promise<TResult>;

@Injectable()
export class PrismaUnitOfWork {
  public constructor(private readonly prisma: PrismaService) {}

  /**
   * Executes a database transaction using the provided handler function.
   * Ensures that all operations within the handler are performed atomically.
   *
   * Args:
   *   handler: A function that receives a Prisma transaction client and returns a promise of the result.
   *
   * Returns:
   *   A promise that resolves to the result of the handler function.
   */
  public async execute<TResult>(handler: TransactionHandler<TResult>): Promise<TResult> {
    return this.prisma['$transaction'](async (transaction: Prisma.TransactionClient) => handler(transaction));
  }
}
