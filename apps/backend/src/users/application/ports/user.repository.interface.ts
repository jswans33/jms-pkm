import type { IRepository } from '../../../shared/domain/repository.interface';
import type { User } from '../../domain/entities/user.entity';
import type { UserId } from '../../domain/value-objects/user-id.value-object';

export interface IUserRepository extends IRepository<User, UserId> {
  readonly findByEmail: (email: Readonly<string>) => Promise<User | null>;
}
