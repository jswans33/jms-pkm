import * as bcrypt from 'bcrypt';

import { User } from '../domain/entities/user.entity';

import { UserMother } from './user.mother';

describe('UserMother', () => {
  interface IExpectedUserProps {
    readonly id?: string;
    readonly email?: string;
    readonly displayName?: string;
    readonly status?: 'active' | 'invited' | 'disabled';
    readonly createdAt?: Date;
    readonly updatedAt?: Date;
  }

  const expectUser = (user: User, expected: IExpectedUserProps): void => {
    expect(user).toBeInstanceOf(User);
    if (expected.id) {
      expect(user.id.toString()).toBe(expected.id);
    }
    if (expected.email) {
      expect(user.email).toBe(expected.email);
    }
    if (expected.displayName) {
      expect(user.displayName).toBe(expected.displayName);
    }
    if (expected.status) {
      expect(user.status).toBe(expected.status);
    }
    if (expected.createdAt) {
      expect(user.createdAt).toEqual(expected.createdAt);
    }
    if (expected.updatedAt) {
      expect(user.updatedAt).toEqual(expected.updatedAt);
    }
  };

  it('creates an active user with defaults', () => {
    const user = UserMother.activeUser();

    expect(user).toBeInstanceOf(User);
    expectUser(user, {
      id: 'user-active-001',
      email: 'active@example.com',
      displayName: 'Active User',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    expect(user.passwordHash).toBeDefined();
    expect(bcrypt.compareSync('Test123!@#', user.passwordHash ?? '')).toBe(true);
  });

  it('creates an invited user without credentials', () => {
    const user = UserMother.invitedUser();

    expect(user).toBeInstanceOf(User);
    expectUser(user, {
      id: 'user-invited-001',
      email: 'invited@example.com',
      displayName: 'Invited User',
      status: 'invited',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    });
    expect(user.passwordHash).toBeUndefined();
  });

  it('creates a disabled user with immutable timestamps', () => {
    const user = UserMother.disabledUser();

    expect(user).toBeInstanceOf(User);
    expectUser(user, {
      id: 'user-disabled-001',
      email: 'disabled@example.com',
      displayName: 'Disabled User',
      status: 'disabled',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-10'),
    });
    expect(user.createdAt).not.toEqual(user.updatedAt);
  });

  it('creates an admin user with dedicated secret', () => {
    const admin = UserMother.adminUser();
    const regular = UserMother.activeUser();

    expect(admin).toBeInstanceOf(User);
    expectUser(admin, {
      id: 'user-admin-001',
      email: 'admin@example.com',
      displayName: 'System Administrator',
      status: 'active',
    });
    expect(admin.passwordHash).toBeDefined();
    expect(admin.passwordHash).not.toBe(regular.passwordHash);
    expect(bcrypt.compareSync('Admin123!@#', admin.passwordHash ?? '')).toBe(true);
  });

  it('creates deterministic John and Jane Doe users', () => {
    const john = UserMother.johnDoe();
    const jane = UserMother.janeDoe();

    expect(john).toBeInstanceOf(User);
    expect(jane).toBeInstanceOf(User);

    expectUser(john, {
      id: 'user-johndoe-001',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      status: 'active',
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
    });

    expectUser(jane, {
      id: 'user-janedoe-001',
      email: 'jane.doe@example.com',
      displayName: 'Jane Doe',
      status: 'active',
      createdAt: new Date('2024-02-16'),
      updatedAt: new Date('2024-02-16'),
    });
  });

  it('creates a user with custom email and hashed password', () => {
    const user = UserMother.withEmail('custom@example.com');

    expect(user.email).toBe('custom@example.com');
    expect(user.displayName).toBe('custom');
    expect(user.passwordHash).toBeDefined();
  });

  it('creates multiple active users with sequential identifiers', () => {
    const users = UserMother.manyActiveUsers(2);

    expect(users).toHaveLength(2);
    expect(users[0]?.email).toBe('user1@example.com');
    expect(users[1]?.email).toBe('user2@example.com');
  });
});
