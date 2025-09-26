import type { User as PrismaUser } from '@prisma/client';

import type { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.value-object';

import { UserPrismaRepository } from './user.prisma.repository';

interface IPrismaUserDelegateMock {
  readonly findUnique: jest.Mock;
  readonly upsert: jest.Mock;
  readonly delete: jest.Mock;
}

const buildPrismaMock = (): { prisma: PrismaService; userDelegate: IPrismaUserDelegateMock } => {
  const userDelegate: IPrismaUserDelegateMock = {
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  };

  const prisma = { user: userDelegate } as unknown as PrismaService;

  return { prisma, userDelegate };
};

const buildPrismaUser = (overrides: Partial<PrismaUser> = {}): PrismaUser => {
  const defaults: PrismaUser = {
    id: UserId.generate().toString(),
    email: 'user@example.com',
    displayName: 'User Example',
    passwordHash: null,
    status: 'active',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  return { ...defaults, ...overrides };
};

describe('UserPrismaRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('maps database users to domain entities on findById', async () => {
    const { prisma, userDelegate } = buildPrismaMock();
    const repository = new UserPrismaRepository(prisma);
    const prismaUser = buildPrismaUser({ passwordHash: 'hashed:password123' });
    userDelegate.findUnique.mockResolvedValue(prismaUser);

    const result = await repository.findById(new UserId(prismaUser.id));

    expect(userDelegate.findUnique).toHaveBeenCalledWith({ where: { id: prismaUser.id } });
    expect(result).not.toBeNull();
    expect(result?.email).toBe(prismaUser.email);
    expect(result?.passwordHash).toBe('hashed:password123');
    expect(result?.status).toBe('active');
  });

  it('returns null when user not found by id', async () => {
    const { prisma, userDelegate } = buildPrismaMock();
    const repository = new UserPrismaRepository(prisma);
    userDelegate.findUnique.mockResolvedValue(null);

    const result = await repository.findById(UserId.generate());

    expect(result).toBeNull();
  });

  it('upserts user data and returns mapped entity', async () => {
    const { prisma, userDelegate } = buildPrismaMock();
    const repository = new UserPrismaRepository(prisma);
    const domainUser = User.create({
      id: UserId.generate(),
      email: 'save@example.com',
      displayName: 'To Save',
      passwordHash: 'hashed:secret',
      status: 'invited',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    const persisted = buildPrismaUser({
      id: domainUser.id.toString(),
      email: domainUser.email,
      displayName: domainUser.displayName,
      passwordHash: domainUser.passwordHash ?? null,
      status: domainUser.status,
    });
    userDelegate.upsert.mockResolvedValue(persisted);

    const result = await repository.save(domainUser);

    expect(userDelegate.upsert).toHaveBeenCalledWith({
      where: { id: domainUser.id.toString() },
      update: {
        email: domainUser.email,
        displayName: domainUser.displayName,
        passwordHash: domainUser.passwordHash ?? null,
        status: domainUser.status,
      },
      create: {
        id: domainUser.id.toString(),
        email: domainUser.email,
        displayName: domainUser.displayName,
        passwordHash: domainUser.passwordHash ?? null,
        status: domainUser.status,
      },
    });
    expect(result.email).toBe(domainUser.email);
    expect(result.passwordHash).toBe(domainUser.passwordHash);
  });

  it('propagates errors when delete fails', async () => {
    const { prisma, userDelegate } = buildPrismaMock();
    const repository = new UserPrismaRepository(prisma);
    const error = new Error('not found');
    userDelegate.delete.mockRejectedValue(error);

    await expect(repository.deleteById(UserId.generate())).rejects.toThrow(error);
  });

  it('returns null when user not found by email', async () => {
    const { prisma, userDelegate } = buildPrismaMock();
    const repository = new UserPrismaRepository(prisma);
    userDelegate.findUnique.mockResolvedValue(null);

    const result = await repository.findByEmail('missing@example.com');

    expect(userDelegate.findUnique).toHaveBeenCalledWith({ where: { email: 'missing@example.com' } });
    expect(result).toBeNull();
  });
});
