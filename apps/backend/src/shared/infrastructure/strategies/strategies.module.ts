import { Module } from '@nestjs/common';

import { ApplicationConfigModule } from '../../../config/config.module';
import { UsersModule } from '../../../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ConsoleAuditStrategy } from './audit/console-audit.strategy';
import { DatabaseAuditStrategy } from './audit/database-audit.strategy';
import { AuditStrategyResolver } from './audit-strategy.resolver';
import { LocalAuthStrategy } from './auth/local-auth.strategy';
import { AuthStrategyResolver } from './auth-strategy.resolver';

const strategies = [
  LocalAuthStrategy,
  ConsoleAuditStrategy,
  DatabaseAuditStrategy,
];

const resolvers = [
  AuthStrategyResolver,
  AuditStrategyResolver,
];

@Module({
  imports: [ApplicationConfigModule, PrismaModule, UsersModule],
  providers: [...strategies, ...resolvers],
  exports: [...resolvers],
})
export class StrategiesModule {}