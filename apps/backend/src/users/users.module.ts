import { Module } from '@nestjs/common';

import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module';

import { CreateUserHandler } from './application/handlers/create-user.handler';
import { GetUserByIdHandler } from './application/handlers/get-user-by-id.handler';
import { UserPrismaRepository } from './infrastructure/repositories/user.prisma.repository';

const repositories = [
  {
    provide: 'IUserRepository',
    useClass: UserPrismaRepository,
  },
];

const handlers = [CreateUserHandler, GetUserByIdHandler];

@Module({
  imports: [PrismaModule],
  providers: [...repositories, ...handlers],
  exports: [...repositories, ...handlers],
})
export class UsersModule {}