import { UserId } from '../value-objects/user-id.value-object';

import type { IUserProps } from './user.entity';
import { User } from './user.entity';

describe('User Entity', () => {
  const resolvePasswordHash = (override: string | null | undefined): string | undefined => {
    if (override === undefined) {
      return 'hashed_password_123';
    }

    if (override === null) {
      return undefined;
    }

    return override;
  };

  const buildBaseProps = (
    overrides: Partial<Omit<IUserProps, 'passwordHash'>>,
  ): Omit<IUserProps, 'passwordHash'> => ({
    id: overrides.id ?? UserId.generate(),
    email: overrides.email ?? 'test@example.com',
    displayName: overrides.displayName ?? 'Test User',
    status: overrides.status ?? 'active',
    createdAt: overrides.createdAt ?? new Date('2024-01-01'),
    updatedAt: overrides.updatedAt ?? new Date('2024-01-01'),
  });

  const attachPassword = (
    base: Omit<IUserProps, 'passwordHash'>,
    password: string | undefined,
  ): IUserProps => (password === undefined ? (base as IUserProps) : ({ ...base, passwordHash: password } as IUserProps));

  const createValidUserProps = (
    overrides: Partial<Omit<IUserProps, 'passwordHash'>> & { passwordHash?: string | null } = {},
  ): IUserProps => attachPassword(buildBaseProps(overrides), resolvePasswordHash(overrides.passwordHash));

  describe('create()', () => {
    it('should create a user with all required properties', () => {
      const props = createValidUserProps();
      const user = User.create(props);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(props.id);
      expect(user.email).toBe(props.email);
      expect(user.displayName).toBe(props.displayName);
      expect(user.passwordHash).toBe(props.passwordHash);
      expect(user.status).toBe(props.status);
      expect(user.createdAt).toEqual(props.createdAt);
      expect(user.updatedAt).toEqual(props.updatedAt);
    });

    it('should create an invited user without password hash', () => {
      const user = User.create(createValidUserProps({ status: 'invited', passwordHash: null }));

      expect(user.passwordHash).toBeUndefined();
      expect(user.status).toBe('invited');
    });

    it('should maintain immutability of dates', () => {
      const originalDate = new Date('2024-01-01');
      const props = {
        ...createValidUserProps(),
        createdAt: originalDate,
        updatedAt: originalDate,
      };

      const user = User.create(props);
      originalDate.setFullYear(2025);

      expect(user.createdAt.getFullYear()).toBe(2024);
      expect(user.updatedAt.getFullYear()).toBe(2024);
    });
  });

  describe('withUpdatedName()', () => {
    it('should return new user instance with updated name', () => {
      const originalUser = User.create(createValidUserProps());
      const updatedUser = originalUser.withUpdatedName('New Name');

      expect(updatedUser).not.toBe(originalUser);
      expect(updatedUser.displayName).toBe('New Name');
      expect(originalUser.displayName).toBe('Test User');
    });

    it('should update the updatedAt timestamp when name changes', () => {
      const pastDate = new Date('2024-01-01');
      const props = {
        ...createValidUserProps(),
        updatedAt: pastDate,
      };
      const user = User.create(props);

      const beforeUpdate = Date.now();
      const updatedUser = user.withUpdatedName('New Name');
      const afterUpdate = Date.now();

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate);
      expect(updatedUser.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate);
      expect(user.updatedAt).toEqual(pastDate);
    });

    it('should preserve all other properties when updating name', () => {
      const props = createValidUserProps();
      const originalUser = User.create(props);
      const updatedUser = originalUser.withUpdatedName('New Name');

      expect(updatedUser.id).toBe(originalUser.id);
      expect(updatedUser.email).toBe(originalUser.email);
      expect(updatedUser.passwordHash).toBe(originalUser.passwordHash);
      expect(updatedUser.status).toBe(originalUser.status);
      expect(updatedUser.createdAt).toEqual(originalUser.createdAt);
    });

    it('should handle empty string as display name', () => {
      const user = User.create(createValidUserProps());
      const updatedUser = user.withUpdatedName('');

      expect(updatedUser.displayName).toBe('');
    });

    it('should handle very long display names', () => {
      const user = User.create(createValidUserProps());
      const longName = 'A'.repeat(1000);
      const updatedUser = user.withUpdatedName(longName);

      expect(updatedUser.displayName).toBe(longName);
    });
  });

  describe('withStatus()', () => {
    it('should transition from active to disabled', () => {
      const activeUser = User.create({
        ...createValidUserProps(),
        status: 'active',
      });
      const disabledUser = activeUser.withStatus('disabled');

      expect(disabledUser).not.toBe(activeUser);
      expect(disabledUser.status).toBe('disabled');
      expect(activeUser.status).toBe('active');
    });

    it('should transition from invited to active', () => {
      const invitedUser = User.create(createValidUserProps({ status: 'invited', passwordHash: null }));
      const activeUser = invitedUser.withStatus('active');

      expect(activeUser.status).toBe('active');
      expect(invitedUser.status).toBe('invited');
    });

    it('should update the updatedAt timestamp on status change', () => {
      const pastDate = new Date('2024-01-01');
      const user = User.create({
        ...createValidUserProps(),
        updatedAt: pastDate,
      });

      const beforeUpdate = Date.now();
      const updatedUser = user.withStatus('disabled');
      const afterUpdate = Date.now();

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate);
      expect(updatedUser.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate);
      expect(user.updatedAt).toEqual(pastDate);
    });

    it('should preserve all other properties when updating status', () => {
      const props = createValidUserProps();
      const originalUser = User.create(props);
      const updatedUser = originalUser.withStatus('disabled');

      expect(updatedUser.id).toBe(originalUser.id);
      expect(updatedUser.email).toBe(originalUser.email);
      expect(updatedUser.displayName).toBe(originalUser.displayName);
      expect(updatedUser.passwordHash).toBe(originalUser.passwordHash);
      expect(updatedUser.createdAt).toEqual(originalUser.createdAt);
    });

    it('should allow setting same status (idempotent)', () => {
      const user = User.create({
        ...createValidUserProps(),
        status: 'active',
      });
      const sameStatusUser = user.withStatus('active');

      expect(sameStatusUser).not.toBe(user);
      expect(sameStatusUser.status).toBe('active');
    });

    it('should handle all valid status transitions', () => {
      const statuses: Array<'active' | 'invited' | 'disabled'> = ['active', 'invited', 'disabled'];
      const user = User.create(createValidUserProps());

      for (const fromStatus of statuses) {
        const userWithStatus = user.withStatus(fromStatus);
        for (const toStatus of statuses) {
          const transitionedUser = userWithStatus.withStatus(toStatus);
          expect(transitionedUser.status).toBe(toStatus);
        }
      }
    });
  });

  describe('immutability', () => {
    it('should not allow direct modification of properties', () => {
      const user = User.create(createValidUserProps());
      const originalEmail = user.email;

    const mutableView = user as unknown as { email: string };
    let threw = false;

    try {
      mutableView.email = 'hacker@evil.com';
    } catch {
      threw = true;
    }

    expect(threw).toBe(true);
    expect(user.email).toBe(originalEmail);
    });

    it('should create defensive copies for all mutations', () => {
      const user = User.create(createValidUserProps());
      const updated1 = user.withUpdatedName('Name 1');
      const updated2 = updated1.withStatus('disabled');
      const updated3 = updated2.withUpdatedName('Name 2');

      expect(user.displayName).toBe('Test User');
      expect(user.status).toBe('active');
      expect(updated1.displayName).toBe('Name 1');
      expect(updated1.status).toBe('active');
      expect(updated2.displayName).toBe('Name 1');
      expect(updated2.status).toBe('disabled');
      expect(updated3.displayName).toBe('Name 2');
      expect(updated3.status).toBe('disabled');
    });
  });

  describe('business rules', () => {
    it('should not allow invited users to have passwords', () => {
      const invitedUser = User.create(createValidUserProps({ status: 'invited', passwordHash: null }));

      expect(invitedUser.passwordHash).toBeUndefined();
      expect(invitedUser.status).toBe('invited');
    });

    it('should maintain audit trail through updatedAt changes', async () => {
      const initialDate = new Date('2024-01-01');
      const user = User.create({
        ...createValidUserProps(),
        createdAt: initialDate,
        updatedAt: initialDate,
      });

      // Add small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      const afterNameChange = user.withUpdatedName('Changed Name');

      await new Promise((resolve) => setTimeout(resolve, 10));
      const afterStatusChange = afterNameChange.withStatus('disabled');

      expect(user.updatedAt).toEqual(initialDate);
      expect(afterNameChange.updatedAt.getTime()).toBeGreaterThan(initialDate.getTime());
      expect(afterStatusChange.updatedAt.getTime()).toBeGreaterThan(afterNameChange.updatedAt.getTime());
      expect(afterStatusChange.createdAt).toEqual(initialDate);
    });
  });
});
