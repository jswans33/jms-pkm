export class CreateUserCommand {
  public constructor(
    public readonly email: string,
    public readonly displayName: string,
  ) {}
}