import { Injectable } from '@nestjs/common';
import type { User as PrismaUser } from '@prisma/client';

import { PrismaService } from '../../../shared/infrastructure/prisma/prisma.service';
import type { IUserRepository } from '../../application/ports/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.value-object';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async findById(id: Readonly<UserId>): Promise<User | null> {
    const data = await this.prisma['user'].findUnique({
      where: { id: id.toString() },
    });
    return data ? this.toDomain(data) : null;
  }

  public async save(entity: Readonly<User>): Promise<User> {
    const userData = {
      email: entity.email,
      displayName: entity.displayName,
      passwordHash: entity.passwordHash,
      status: entity.status,
    };
    const data = await this.prisma['user'].upsert({
      where: { id: entity.id.toString() },
      update: userData,
      create: { id: entity.id.toString(), ...userData },
    });
    return this.toDomain(data);
  }

  public async deleteById(id: Readonly<UserId>): Promise<void> {
    await this.prisma['user'].delete({
      where: { id: id.toString() },
    });
  }

  public async findByEmail(email: Readonly<string>): Promise<User | null> {
    const data = await this.prisma['user'].findUnique({
      where: { email },
    });
    return data ? this.toDomain(data) : null;
  }

  private toDomain(data: Readonly<PrismaUser>): User {
    return User.create({
      id: new UserId(data.id),
      email: data.email,
      displayName: data.displayName,
      passwordHash: data.passwordHash ?? undefined,
      status: data.status as 'active' | 'invited' | 'disabled',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}