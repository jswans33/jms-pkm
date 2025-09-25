import { Test, TestingModule } from '@nestjs/testing';

import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  const service: Pick<HealthService, 'assertDependenciesHealthy'> = {
    assertDependenciesHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns ok when dependencies are healthy', async () => {
    (service.assertDependenciesHealthy as jest.Mock).mockResolvedValueOnce(undefined);

    await expect(controller.getConfigurationHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('propagates failures from the health service', async () => {
    (service.assertDependenciesHealthy as jest.Mock).mockRejectedValueOnce(new Error('failure'));

    await expect(controller.getConfigurationHealth()).rejects.toHaveProperty(
      'message',
      'failure',
    );
  });
});
