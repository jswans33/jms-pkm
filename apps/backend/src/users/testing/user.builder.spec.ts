import * as bcrypt from 'bcrypt';

import { User } from '../domain/entities/user.entity';
import { UserId } from '../domain/value-objects/user-id.value-object';

import { UserBuilder } from './user.builder';

describe('UserBuilder', () => {
  describe('build()', () => {
    it('should create user with default values', () => {
      const user = UserBuilder.aUser().build();

      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
      expect(user.status).toBe('active');
      expect(user.passwordHash).toBeUndefined();
    });

    it('should create valid User domain entity', () => {
      const user = UserBuilder.aUser().build();

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
    });
  });

  describe('withId()', () => {
    it('should set custom id', () => {
      const user = UserBuilder.aUser()
        .withId('custom-id-123')
        .build();

      expect(user.id.toString()).toBe('custom-id-123');
    });
  });

  describe('withEmail()', () => {
    it('should set custom email', () => {
      const user = UserBuilder.aUser()
        .withEmail('builder@example.com')
        .build();

      expect(user.email).toBe('builder@example.com');
    });
  });

  describe('withDisplayName()', () => {
    it('should set custom display name', () => {
      const user = UserBuilder.aUser()
        .withDisplayName('Builder User')
        .build();

      expect(user.displayName).toBe('Builder User');
    });
  });

  describe('withPassword()', () => {
    it('should hash and set password', () => {
      const user = UserBuilder.aUser()
        .withPassword('SecurePass123!')
        .build();

      expect(user.passwordHash).toBeDefined();
      expect(typeof user.passwordHash).toBe('string');
      expect(bcrypt.compareSync('SecurePass123!', user.passwordHash ?? '')).toBe(true);
    });
  });

  describe('withPasswordHash()', () => {
    it('should set password hash directly', () => {
      const hash = 'pre-hashed-password';
      const user = UserBuilder.aUser()
        .withPasswordHash(hash)
        .build();

      expect(user.passwordHash).toBe(hash);
    });
  });

  describe('withStatus()', () => {
    it('should set user status', () => {
      const user = UserBuilder.aUser()
        .withStatus('disabled')
        .build();

      expect(user.status).toBe('disabled');
    });
  });

  describe('asActive()', () => {
    it('should set status to active', () => {
      const user = UserBuilder.aUser()
        .asDisabled()
        .asActive()
        .build();

      expect(user.status).toBe('active');
    });
  });

  describe('asInvited()', () => {
    it('should set status to invited and clear password', () => {
      const user = UserBuilder.aUser()
        .withPassword('should-be-cleared')
        .asInvited()
        .build();

      expect(user.status).toBe('invited');
      expect(user.passwordHash).toBeUndefined();
    });
  });

  describe('asDisabled()', () => {
    it('should set status to disabled', () => {
      const user = UserBuilder.aUser()
        .asDisabled()
        .build();

      expect(user.status).toBe('disabled');
    });

    it('should preserve password when disabled', () => {
      const user = UserBuilder.aUser()
        .withPasswordHash('preserved-hash')
        .asDisabled()
        .build();

      expect(user.status).toBe('disabled');
      expect(user.passwordHash).toBe('preserved-hash');
    });
  });

  describe('asAdmin()', () => {
    it('should configure admin user properties', () => {
      const user = UserBuilder.aUser()
        .asAdmin()
        .build();

      expect(user.email).toBe('admin@example.com');
      expect(user.displayName).toBe('Administrator');
      expect(user.status).toBe('active');
    });

    it('should override previous settings', () => {
      const user = UserBuilder.aUser()
        .withEmail('regular@example.com')
        .withDisplayName('Regular User')
        .asDisabled()
        .asAdmin()
        .build();

      expect(user.email).toBe('admin@example.com');
      expect(user.displayName).toBe('Administrator');
      expect(user.status).toBe('active');
    });
  });

  describe('withCreatedAt()', () => {
    it('should set creation date', () => {
      const date = new Date('2024-01-15');
      const user = UserBuilder.aUser()
        .withCreatedAt(date)
        .build();

      expect(user.createdAt).toEqual(date);
    });
  });

  describe('withUpdatedAt()', () => {
    it('should set update date', () => {
      const date = new Date('2024-02-20');
      const user = UserBuilder.aUser()
        .withUpdatedAt(date)
        .build();

      expect(user.updatedAt).toEqual(date);
    });
  });

  describe('withTimestamps()', () => {
    it('should set both created and updated dates', () => {
      const date = new Date('2024-03-10');
      const user = UserBuilder.aUser()
        .withTimestamps(date)
        .build();

      expect(user.createdAt).toEqual(date);
      expect(user.updatedAt).toEqual(date);
    });
  });

  describe('static factory methods', () => {
    it('should create regular user builder', () => {
      const user = UserBuilder.aUser().build();

      expect(user.email).toBe('test@example.com');
      expect(user.displayName).toBe('Test User');
    });

    it('should create admin user builder', () => {
      const user = UserBuilder.anAdminUser().build();

      expect(user.email).toBe('admin@example.com');
      expect(user.displayName).toBe('Administrator');
      expect(user.status).toBe('active');
    });

    it('should create invited user builder', () => {
      const user = UserBuilder.anInvitedUser().build();

      expect(user.status).toBe('invited');
      expect(user.passwordHash).toBeUndefined();
    });
  });

  describe('method chaining', () => {
    it('should support fluent interface chaining', () => {
      const date = new Date('2024-01-01');
      const user = UserBuilder.aUser()
        .withEmail('chained@example.com')
        .withDisplayName('Chained User')
        .withPassword('ChainedPass123!')
        .withStatus('active')
        .withTimestamps(date)
        .build();

      expect(user.email).toBe('chained@example.com');
      expect(user.displayName).toBe('Chained User');
      expect(user.status).toBe('active');
      expect(user.passwordHash).toBeDefined();
      expect(user.createdAt).toEqual(date);
      expect(user.updatedAt).toEqual(date);
    });

    it('should allow overriding previous values in chain', () => {
      const user = UserBuilder.aUser()
        .withEmail('first@example.com')
        .withEmail('second@example.com')
        .withEmail('final@example.com')
        .build();

      expect(user.email).toBe('final@example.com');
    });
  });
});
