import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { ApplicationConfigService } from '../src/config/config.service';

const OK_STATUS = 200;

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let configService: ApplicationConfigService;

  beforeEach(async (): Promise<void> => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configService = app.get(ApplicationConfigService);
    await app.init();
  });

  it('/ (GET)', async (): Promise<void> => {
    const prefix = configService.app.apiPrefix;
    const basePath = prefix.length > 0 ? `/${prefix}` : '/';

    await request(app.getHttpServer())
      .get(basePath)
      .expect(OK_STATUS)
      .expect('Hello World!');
  });

  it('/health/config (GET)', async (): Promise<void> => {
    const prefix = configService.app.apiPrefix;
    const healthPath = prefix.length > 0 ? `/${prefix}/health/config` : '/health/config';

    await request(app.getHttpServer())
      .get(healthPath)
      .expect(OK_STATUS)
      .expect({ status: 'ok' });
  });
});
