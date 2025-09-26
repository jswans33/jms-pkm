import { Inject, Injectable } from '@nestjs/common';

import type { User } from '../../domain/entities/user.entity';
import type { IUserRepository } from '../ports/user.repository.interface';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';

@Injectable()
export class GetUserByIdHandler {
  public constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  public async execute(query: Readonly<GetUserByIdQuery>): Promise<User | null> {
    return this.userRepository.findById(query.id);
  }
}