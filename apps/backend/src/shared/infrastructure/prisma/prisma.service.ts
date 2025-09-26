import type { INestApplication } from '@nestjs/common';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
// Force restart to pick up PORT=3001

const resolveLogLevels = (): Array<'info' | 'query' | 'warn' | 'error'> => {
  if (process.env['NODE_ENV'] === 'production') {
    return ['error'];
  }

  return ['warn', 'error'];
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public constructor() {
    super({ log: resolveLogLevels() });
  }

  public async onModuleInit(): Promise<void> {
    await this['$connect']();
  }

  public async enableShutdownHooks(app: Readonly<INestApplication>): Promise<void> {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  public async onModuleDestroy(): Promise<void> {
    await this['$disconnect']();
  }
}
