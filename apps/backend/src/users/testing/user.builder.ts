import { randomUUID } from 'crypto';

import * as bcrypt from 'bcrypt';

import { User } from '../domain/entities/user.entity';
import { UserId } from '../domain/value-objects/user-id.value-object';

const BCRYPT_ROUNDS = 10;

export class UserBuilder {
  private id: string = randomUUID();
  private email: string = 'test@example.com';
  private displayName: string = 'Test User';
  private passwordHash: string | undefined = undefined;
  private status: 'active' | 'invited' | 'disabled' = 'active';
  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();

  public withId(id: string): this {
    this.id = id;
    return this;
  }

  public withEmail(email: string): this {
    this.email = email;
    return this;
  }

  public withDisplayName(displayName: string): this {
    this.displayName = displayName;
    return this;
  }

  public withPassword(plainPassword: string): this {
    this.passwordHash = bcrypt.hashSync(plainPassword, BCRYPT_ROUNDS);
    return this;
  }

  public withPasswordHash(hash: string): this {
    this.passwordHash = hash;
    return this;
  }

  public withStatus(status: 'active' | 'invited' | 'disabled'): this {
    this.status = status;
    return this;
  }

  public asActive(): this {
    this.status = 'active';
    return this;
  }

  public asInvited(): this {
    this.status = 'invited';
    this.passwordHash = undefined;
    return this;
  }

  public asDisabled(): this {
    this.status = 'disabled';
    return this;
  }

  public asAdmin(): this {
    this.email = 'admin@example.com';
    this.displayName = 'Administrator';
    this.status = 'active';
    return this;
  }

  public withCreatedAt(date: Date): this {
    this.createdAt = date;
    return this;
  }

  public withUpdatedAt(date: Date): this {
    this.updatedAt = date;
    return this;
  }

  public withTimestamps(date: Date): this {
    this.createdAt = date;
    this.updatedAt = date;
    return this;
  }

  public build(): User {
    const baseProps: Parameters<typeof User.create>[0] = {
      id: new UserId(this.id),
      email: this.email,
      displayName: this.displayName,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    const passwordHash = this.passwordHash;

    if (passwordHash === undefined) {
      return User.create(baseProps);
    }

    return User.create({ ...baseProps, passwordHash });
  }

  public static aUser(): UserBuilder {
    return new UserBuilder();
  }

  public static anAdminUser(): UserBuilder {
    return new UserBuilder().asAdmin();
  }

  public static anInvitedUser(): UserBuilder {
    return new UserBuilder().asInvited();
  }
}
