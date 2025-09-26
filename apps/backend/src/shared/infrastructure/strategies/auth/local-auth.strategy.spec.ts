import type { ApplicationConfigService } from '../../../../config/config.service';
import type { IUserRepository } from '../../../../users/application/ports/user.repository.interface';
import { User } from '../../../../users/domain/entities/user.entity';
import { UserId } from '../../../../users/domain/value-objects/user-id.value-object';
import type { IAuthCredentials, IAuthUser } from '../../../application/strategies/auth-strategy.interface';

import { LocalAuthStrategy } from './local-auth.strategy';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (value: string) => `hashed:${value}`),
  compare: jest.fn(async (value: string, hash: string) => hash === `hashed:${value}`),
}));

const createConfigStub = (): ApplicationConfigService => {
  const config = {
    security: {
      jwtSecret: 'test-secret',
      sessionSecret: 'session',
      apiKey: undefined,
    },
    isProduction: jest.fn().mockReturnValue(false),
    app: {
      name: 'app',
      environment: 'testing',
      port: 3000,
      apiPrefix: 'api',
      corsOrigins: [],
      logLevel: 'debug',
      logFormat: 'pretty',
    },
  } as const;

  return config as unknown as ApplicationConfigService;
};

const createRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  deleteById: jest.fn(),
});

const createStrategy = (repository?: jest.Mocked<IUserRepository>): LocalAuthStrategy =>
  new LocalAuthStrategy(createConfigStub(), repository ?? createRepositoryMock());

describe('LocalAuthStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const adminCredentials: IAuthCredentials = {
    email: 'admin@example.com',
    password: 'admin123',
  };

  it('bootstraps the default admin user when authenticating with admin credentials', async () => {
    const repository = createRepositoryMock();
    repository.findByEmail
      .mockResolvedValueOnce(null) // initial admin lookup in authenticate
      .mockResolvedValueOnce(null); // lookup inside ensureAdminUser
    repository.save.mockImplementation(async (user) => user as unknown as User);

    const strategy = createStrategy(repository);

    const result = await strategy.authenticate(adminCredentials);

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      email: adminCredentials.email,
      roles: ['admin', 'user'],
    });
  });

  it('authenticates an existing user when password matches', async () => {
    const repository = createRepositoryMock();
    const user = User.create({
      id: UserId.generate(),
      email: 'member@example.com',
      displayName: 'Member Example',
      status: 'active',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      passwordHash: 'hashed:password123',
    });

    repository.findByEmail.mockResolvedValue(user);

    const strategy = createStrategy(repository);

    const result = await strategy.authenticate({
      email: 'member@example.com',
      password: 'password123',
    });

    expect(result).toEqual<IAuthUser>({
      id: user.id.toString(),
      email: 'member@example.com',
      displayName: user.displayName,
      roles: ['user'],
    });
  });

  it('throws when credentials are invalid', async () => {
    const repository = createRepositoryMock();
    repository.findByEmail.mockResolvedValue(null);

    const strategy = createStrategy(repository);

    await expect(
      strategy.authenticate({ email: 'missing@example.com', password: 'nope' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('revokes and validates tokens correctly', async () => {
    const repository = createRepositoryMock();
    const user = User.create({
      id: UserId.generate(),
      email: 'member@example.com',
      displayName: 'Member Example',
      status: 'active',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
      passwordHash: 'hashed:password123',
    });
    repository.findByEmail.mockResolvedValue(user);

    const strategy = createStrategy(repository);
    const tokens = await strategy.generateTokens({
      id: user.id.toString(),
      email: user.email,
      displayName: user.displayName,
      roles: ['user'],
    });

    const validated = await strategy.validateToken(tokens.accessToken);
    expect(validated).toMatchObject({ email: user.email });

    await strategy.revokeToken(tokens.accessToken);
    const afterRevoke = await strategy.validateToken(tokens.accessToken);
    expect(afterRevoke).toBeNull();
  });
});
