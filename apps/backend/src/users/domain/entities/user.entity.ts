import type { UserId } from '../value-objects/user-id.value-object';

export interface IUserProps {
  readonly id: UserId;
  readonly email: string;
  readonly displayName: string;
  readonly passwordHash?: string;
  readonly status: 'active' | 'invited' | 'disabled';
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class User {
  private constructor(private readonly props: IUserProps) {}

  public static create(props: IUserProps): User {
    return new User(props);
  }

  public get id(): UserId {
    return this.props.id;
  }

  public get email(): string {
    return this.props.email;
  }

  public get displayName(): string {
    return this.props.displayName;
  }

  public get passwordHash(): string | undefined {
    return this.props.passwordHash;
  }

  public get status(): IUserProps['status'] {
    return this.props.status;
  }

  public get createdAt(): Date {
    return this.props.createdAt;
  }

  public get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public withUpdatedName(displayName: string): User {
    return User.create({ ...this.props, displayName, updatedAt: new Date() });
  }

  public withStatus(status: IUserProps['status']): User {
    return User.create({ ...this.props, status, updatedAt: new Date() });
  }
}
