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

const cloneDate = (date: Date): Date => new Date(date.getTime());

export class User {
  private constructor(private readonly props: IUserProps) {}

  public static create(props: IUserProps): User {
    return new User({
      ...props,
      createdAt: cloneDate(props.createdAt),
      updatedAt: cloneDate(props.updatedAt),
    });
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
    return cloneDate(this.props.createdAt);
  }

  public get updatedAt(): Date {
    return cloneDate(this.props.updatedAt);
  }

  public withUpdatedName(displayName: string): User {
    return User.create({
      ...this.props,
      displayName,
      updatedAt: User.resolveNextTimestamp(this.props.updatedAt),
    });
  }

  public withStatus(status: IUserProps['status']): User {
    return User.create({
      ...this.props,
      status,
      updatedAt: User.resolveNextTimestamp(this.props.updatedAt),
    });
  }

  private static resolveNextTimestamp(previous: Date): Date {
    const previousTime = previous.getTime();
    const now = Date.now();
    const candidate = now > previousTime ? now : previousTime + 1;
    return new Date(candidate);
  }
}
