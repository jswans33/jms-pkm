import { randomUUID } from 'crypto';

import { User } from '../domain/entities/user.entity';
import { UserId } from '../domain/value-objects/user-id.value-object';

interface IUserFactoryOverrides {
  readonly id?: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly passwordHash?: string;
  readonly status?: 'active' | 'invited' | 'disabled';
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export class UserFactory {
  private static counter = 0;

  public static resetCounter(): void {
    UserFactory.counter = 0;
  }

  public static build(overrides: IUserFactoryOverrides = {}): User {
    const count = ++UserFactory.counter;
    const now = new Date();

    const props = UserFactory.resolveBaseProps({ overrides, count, now });
    const { passwordHash } = overrides;

    if (passwordHash === undefined) {
      return User.create(props);
    }

    return User.create({ ...props, passwordHash });
  }

  public static buildMany(
    count: number,
    overrides: IUserFactoryOverrides = {},
  ): ReadonlyArray<User> {
    return Array.from({ length: count }, () => UserFactory.build(overrides));
  }

  public static buildWithPasswordHash(
    passwordHash: string,
    overrides: IUserFactoryOverrides = {},
  ): User {
    return UserFactory.build({ ...overrides, passwordHash });
  }

  public static buildInvited(overrides: IUserFactoryOverrides = {}): User {
    const withoutPassword = { ...overrides };
    delete (withoutPassword as { passwordHash?: string }).passwordHash;
    return UserFactory.build({ ...withoutPassword, status: 'invited' });
  }

  public static buildDisabled(overrides: IUserFactoryOverrides = {}): User {
    return UserFactory.build({ ...overrides, status: 'disabled' });
  }

  public static buildAdmin(overrides: IUserFactoryOverrides = {}): User {
    return UserFactory.build({
      ...overrides,
      email: overrides.email ?? 'admin@example.com',
      displayName: overrides.displayName ?? 'Administrator',
      status: 'active',
    });
  }

  private static resolveBaseProps({
    overrides,
    count,
    now,
  }: {
    readonly overrides: IUserFactoryOverrides;
    readonly count: number;
    readonly now: Date;
  }): Parameters<typeof User.create>[0] {
    return {
      id: new UserId(overrides.id ?? randomUUID()),
      email: overrides.email ?? `user${count}@example.com`,
      displayName: overrides.displayName ?? `User ${count}`,
      status: overrides.status ?? 'active',
      createdAt: overrides.createdAt ?? now,
      updatedAt: overrides.updatedAt ?? now,
    };
  }
}
