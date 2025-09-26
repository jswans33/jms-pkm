import { User } from '../domain/entities/user.entity';
import { UserId } from '../domain/value-objects/user-id.value-object';

import { UserFactory } from './user.factory';

describe('UserFactory', () => {
  beforeEach(() => {
    UserFactory.resetCounter();
  });

  describe('build()', () => {
    it('should create a user with auto-incrementing defaults', () => {
      const user1 = UserFactory.build();
      const user2 = UserFactory.build();

      expect(user1.email).toBe('user1@example.com');
      expect(user1.displayName).toBe('User 1');
      expect(user1.status).toBe('active');
      expect(user1.passwordHash).toBeUndefined();

      expect(user2.email).toBe('user2@example.com');
      expect(user2.displayName).toBe('User 2');
    });

    it('should accept overrides for all properties', () => {
      const customDate = new Date('2024-01-01');
      const user = UserFactory.build({
        id: 'custom-id',
        email: 'custom@example.com',
        displayName: 'Custom User',
        status: 'disabled',
        createdAt: customDate,
        updatedAt: customDate,
      });

      expect(user.id.toString()).toBe('custom-id');
      expect(user.email).toBe('custom@example.com');
      expect(user.displayName).toBe('Custom User');
      expect(user.status).toBe('disabled');
      expect(user.createdAt).toEqual(customDate);
      expect(user.updatedAt).toEqual(customDate);
    });

    it('should handle passwordHash override correctly', () => {
      const user = UserFactory.build({
        passwordHash: 'hashed-password',
      });

      expect(user.passwordHash).toBe('hashed-password');
    });

    it('should create valid User domain entities', () => {
      const user = UserFactory.build();

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
    });
  });

  describe('buildMany()', () => {
    it('should create multiple users with sequential numbering', () => {
      const users = UserFactory.buildMany(3);

      expect(users).toHaveLength(3);
      expect(users[0]?.email).toBe('user1@example.com');
      expect(users[1]?.email).toBe('user2@example.com');
      expect(users[2]?.email).toBe('user3@example.com');
    });

    it('should apply overrides to all created users', () => {
      const users = UserFactory.buildMany(2, {
        status: 'invited',
        displayName: 'Invited User',
      });

      expect(users[0]?.status).toBe('invited');
      expect(users[0]?.displayName).toBe('Invited User');
      expect(users[1]?.status).toBe('invited');
      expect(users[1]?.displayName).toBe('Invited User');
    });

    it('should return readonly array', () => {
      const users = UserFactory.buildMany(2);
      expect(Object.isFrozen(users)).toBe(false);
      expect(Array.isArray(users)).toBe(true);
    });
  });

  describe('buildWithPasswordHash()', () => {
    it('should create user with specified password hash', () => {
      const hash = 'bcrypt-hash-123';
      const user = UserFactory.buildWithPasswordHash(hash);

      expect(user.passwordHash).toBe(hash);
      expect(user.status).toBe('active');
    });

    it('should apply overrides along with password hash', () => {
      const hash = 'bcrypt-hash-456';
      const user = UserFactory.buildWithPasswordHash(hash, {
        email: 'secured@example.com',
        status: 'disabled',
      });

      expect(user.passwordHash).toBe(hash);
      expect(user.email).toBe('secured@example.com');
      expect(user.status).toBe('disabled');
    });
  });

  describe('buildInvited()', () => {
    it('should create invited user without password', () => {
      const user = UserFactory.buildInvited();

      expect(user.status).toBe('invited');
      expect(user.passwordHash).toBeUndefined();
    });

    it('should ignore passwordHash override for invited users', () => {
      const user = UserFactory.buildInvited({
        passwordHash: 'should-be-ignored',
      });

      expect(user.status).toBe('invited');
      expect(user.passwordHash).toBeUndefined();
    });

    it('should apply other overrides correctly', () => {
      const user = UserFactory.buildInvited({
        email: 'pending@example.com',
        displayName: 'Pending User',
      });

      expect(user.email).toBe('pending@example.com');
      expect(user.displayName).toBe('Pending User');
      expect(user.status).toBe('invited');
    });
  });

  describe('buildDisabled()', () => {
    it('should create disabled user', () => {
      const user = UserFactory.buildDisabled();

      expect(user.status).toBe('disabled');
    });

    it('should apply overrides to disabled user', () => {
      const user = UserFactory.buildDisabled({
        email: 'blocked@example.com',
        passwordHash: 'old-hash',
      });

      expect(user.email).toBe('blocked@example.com');
      expect(user.passwordHash).toBe('old-hash');
      expect(user.status).toBe('disabled');
    });
  });

  describe('buildAdmin()', () => {
    it('should create admin user with default admin properties', () => {
      const user = UserFactory.buildAdmin();

      expect(user.email).toBe('admin@example.com');
      expect(user.displayName).toBe('Administrator');
      expect(user.status).toBe('active');
    });

    it('should allow email override for admin', () => {
      const user = UserFactory.buildAdmin({
        email: 'superadmin@example.com',
      });

      expect(user.email).toBe('superadmin@example.com');
      expect(user.displayName).toBe('Administrator');
    });

    it('should allow displayName override for admin', () => {
      const user = UserFactory.buildAdmin({
        displayName: 'Super Admin',
      });

      expect(user.email).toBe('admin@example.com');
      expect(user.displayName).toBe('Super Admin');
    });
  });

  describe('resetCounter()', () => {
    it('should reset the internal counter', () => {
      const user1 = UserFactory.build();
      expect(user1.email).toBe('user1@example.com');

      UserFactory.resetCounter();

      const user2 = UserFactory.build();
      expect(user2.email).toBe('user1@example.com');
    });

    it('should not affect other properties when resetting', () => {
      UserFactory.build();
      UserFactory.build();

      UserFactory.resetCounter();

      const user = UserFactory.build({
        status: 'disabled',
      });

      expect(user.email).toBe('user1@example.com');
      expect(user.status).toBe('disabled');
    });
  });
});
