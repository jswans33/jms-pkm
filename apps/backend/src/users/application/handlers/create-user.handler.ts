import { Inject, Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import { UserId } from '../../domain/value-objects/user-id.value-object';
import { CreateUserCommand } from '../commands/create-user.command';
import type { IUserRepository } from '../ports/user.repository.interface';

@Injectable()
export class CreateUserHandler {
  public constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  public async execute(command: Readonly<CreateUserCommand>): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = User.create({
      id: UserId.generate(),
      email: command.email,
      displayName: command.displayName,
      status: 'invited',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.save(user);
  }
}