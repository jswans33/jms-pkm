import * as bcrypt from 'bcrypt';

import { User } from '../domain/entities/user.entity';
import { UserId } from '../domain/value-objects/user-id.value-object';

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('Test123!@#', 10);
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('Admin123!@#', 10);
const ID_PAD_LENGTH = 3;

/**
 * Object Mother pattern for creating common User test objects.
 * Provides pre-configured User entities for typical test scenarios.
 */
export class UserMother {
  public static activeUser(): User {
    return User.create({
      id: new UserId('user-active-001'),
      email: 'active@example.com',
      displayName: 'Active User',
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  }

  public static invitedUser(): User {
    return User.create({
      id: new UserId('user-invited-001'),
      email: 'invited@example.com',
      displayName: 'Invited User',
      status: 'invited',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    });
  }

  public static disabledUser(): User {
    return User.create({
      id: new UserId('user-disabled-001'),
      email: 'disabled@example.com',
      displayName: 'Disabled User',
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'disabled',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-10'),
    });
  }

  public static adminUser(): User {
    return User.create({
      id: new UserId('user-admin-001'),
      email: 'admin@example.com',
      displayName: 'System Administrator',
      passwordHash: ADMIN_PASSWORD_HASH,
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  }

  public static johnDoe(): User {
    return User.create({
      id: new UserId('user-johndoe-001'),
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'active',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
    });
  }

  public static janeDoe(): User {
    return User.create({
      id: new UserId('user-janedoe-001'),
      email: 'jane.doe@example.com',
      displayName: 'Jane Doe',
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'active',
      createdAt: new Date('2024-02-16'),
      updatedAt: new Date('2024-02-16'),
    });
  }

  public static withEmail(email: string): User {
    return User.create({
      id: new UserId(`user-${email.replace('@', '-at-').replace('.', '-')}`),
      email,
      displayName: email.split('@')[0] ?? 'User',
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static manyActiveUsers(count: number): ReadonlyArray<User> {
    return Array.from({ length: count }, (_, i) =>
      User.create({
        id: new UserId(`user-active-${String(i + 1).padStart(ID_PAD_LENGTH, '0')}`),
        email: `user${i + 1}@example.com`,
        displayName: `User ${i + 1}`,
        passwordHash: DEFAULT_PASSWORD_HASH,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  }
}
