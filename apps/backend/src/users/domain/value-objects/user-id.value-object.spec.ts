import { UserId } from './user-id.value-object';

describe('UserId', () => {
  const expectThrowsInvalidId = (value: string): void => {
    let thrown = false;

    try {
      new UserId(value);
    } catch (error) {
      thrown = true;
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Invalid user id');
    }

    expect(thrown).toBe(true);
  };

  test('accepts valid UUID v4', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const userId = new UserId(validUuid);

    expect(userId.toString()).toBe(validUuid);
  });

  test('accepts valid test identifiers', () => {
    const ids = ['user-1', 'test-user-123', 'simple-id'];

    for (const id of ids) {
      const userId = new UserId(id);
      expect(userId.toString()).toBe(id);
    }
  });

  test('rejects empty string', () => {
    expectThrowsInvalidId('');
    expect(UserId.isValid('')).toBe(false);
  });

  test('rejects identifiers with invalid characters', () => {
    const invalidIds = ['user@test', 'user#123', 'user$test', 'user!id', 'user id', 'user/test'];

    for (const id of invalidIds) {
      expectThrowsInvalidId(id);
      expect(UserId.isValid(id)).toBe(false);
    }
  });

  test('rejects identifiers longer than 100 characters', () => {
    expectThrowsInvalidId('a'.repeat(101));
    expect(UserId.isValid('a'.repeat(101))).toBe(false);
  });

  test('accepts identifiers up to 100 characters', () => {
    const maxLengthId = 'a'.repeat(100);
    const userId = new UserId(maxLengthId);

    expect(userId.toString()).toBe(maxLengthId);
  });

  test('is case insensitive for UUID format', () => {
    const variants = [
      '550e8400-e29b-41d4-a716-446655440000',
      '550E8400-E29B-41D4-A716-446655440000',
      '550e8400-E29B-41d4-A716-446655440000',
    ];

    for (const value of variants) {
      const createId = (): UserId => new UserId(value);
      expect(createId).not.toThrow();
    }
  });

  test('generate() yields unique identifiers', () => {
    const iterations = 500;
    const ids = new Set<string>();

    for (let index = 0; index < iterations; index += 1) {
      ids.add(UserId.generate().toString());
    }

    expect(ids.size).toBe(iterations);
  });

  test('isValid() recognises supported formats', () => {
    const valid = [
      '550e8400-e29b-41d4-a716-446655440000',
      'TEST-USER-123',
      'simple-id',
      '123456789',
    ];

    for (const value of valid) {
      expect(UserId.isValid(value)).toBe(true);
    }
  });

  test('isValid() rejects unsupported formats', () => {
    const invalid = ['', 'user@test', 'user#123', 'a'.repeat(101)];

    for (const value of invalid) {
      expect(UserId.isValid(value)).toBe(false);
    }
  });

  test('preserves original casing in toString()', () => {
    const mixedCase = '550E8400-e29B-41D4-a716-446655440000';
    const userId = new UserId(mixedCase);

    expect(userId.toString()).toBe(mixedCase);
  });

  test('value object equality relies on underlying value', () => {
    const value = '550e8400-e29b-41d4-a716-446655440000';
    const userId1 = new UserId(value);
    const userId2 = new UserId(value);

    expect(userId1.toString()).toBe(userId2.toString());
    expect(userId1).not.toBe(userId2);
  });

  test('is frozen against mutation attempts', () => {
    const userId = new UserId('test-id');
    const mutable = userId as unknown as { value?: string };

    expect(() => {
      mutable.value = 'hacked';
    }).toThrow();
    expect(userId.toString()).toBe('test-id');
  });

  test('only exposes value via toString', () => {
    const userId = new UserId('test-id');
    const internalAccess = userId as unknown as { value?: string };

    expect(userId.toString()).toBe('test-id');
    expect(typeof internalAccess.value).toBe('string');
  });

  test('rejects potential XSS payloads', () => {
    const payloads = [
      '<script>alert("xss")</script>',
      '"><script>alert(1)</script>',
      'javascript:alert(1)',
      'onclick="alert(1)"',
    ];

    for (const payload of payloads) {
      expectThrowsInvalidId(payload);
      expect(UserId.isValid(payload)).toBe(false);
    }
  });

  test('rejects SQL injection attempts', () => {
    const payloads = [
      "'; DROP TABLE users; --",
      '1 OR 1=1',
      "admin'--",
      "' OR '1'='1",
    ];

    for (const payload of payloads) {
      expectThrowsInvalidId(payload);
      expect(UserId.isValid(payload)).toBe(false);
    }
  });
});
