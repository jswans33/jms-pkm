import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { ApplicationConfigService } from './config/config.service';
import { PrismaService } from './shared/infrastructure/prisma/prisma.service';

const applyCors = (app: Readonly<INestApplication>, origins: ReadonlyArray<string>): void => {
  if (origins.length === 0) {
    app.enableCors();
    return;
  }

  if (origins.includes('*')) {
    app.enableCors({ origin: true });
    return;
  }

  app.enableCors({ origin: origins });
};

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ApplicationConfigService);
  const prisma = app.get(PrismaService);
  const { port, apiPrefix, corsOrigins } = config.app;

  if (apiPrefix.length > 0) {
    app.setGlobalPrefix(apiPrefix);
  }

  applyCors(app, corsOrigins);
  await prisma.enableShutdownHooks(app);

  await app.listen(port);
};

void bootstrap();
