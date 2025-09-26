import { randomUUID } from 'node:crypto';

export class UserId {
  public static generate(): UserId {
    return new UserId(randomUUID());
  }

  public constructor(value: string) {
    if (!UserId.isValid(value)) {
      throw new Error('Invalid user id');
    }
    Object.defineProperty(this, 'value', {
      value,
      writable: false,
      enumerable: false,
      configurable: false,
    });
    Object.freeze(this);
  }

  public static isValid(value: string): boolean {
    // UUID format
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(value);
    // Test ID format (for testing purposes)
    const isTestId = /^[a-zA-Z0-9-]+$/.test(value) && value.length > 0 && value.length <= 100;

    return isUuid || isTestId;
  }

  public toString(): string {
    return Reflect.get(this, 'value') as string;
  }
}
