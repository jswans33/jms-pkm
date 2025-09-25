import process from 'node:process';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const DEFAULT_PORT = 3000;

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env['PORT'] ?? DEFAULT_PORT);

  await app.listen(port);
};

void bootstrap();
