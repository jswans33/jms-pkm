import type { UserId } from '../../domain/value-objects/user-id.value-object';

export class GetUserByIdQuery {
  public constructor(public readonly id: UserId) {}
}