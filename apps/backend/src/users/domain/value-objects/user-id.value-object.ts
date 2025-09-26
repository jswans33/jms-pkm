import { randomUUID } from 'node:crypto';

export class UserId {
  public static generate(): UserId {
    return new UserId(randomUUID());
  }

  public constructor(private readonly value: string) {
    if (!UserId.isValid(value)) {
      throw new Error('Invalid user id');
    }
  }

  public static isValid(value: string): boolean {
    return /^[0-9a-fA-F-]{36}$/.test(value);
  }

  public toString(): string {
    return this.value;
  }
}
