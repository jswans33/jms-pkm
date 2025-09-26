# ADR-003: Prisma as ORM and Database Toolkit

## Status

Accepted

## Date

2025-09-26

## Context

We need a robust solution for database access, schema management, and migrations in our NestJS backend. The solution must support:

- Type-safe database queries with TypeScript integration
- Schema versioning and migration management
- Repository pattern implementation
- Transaction support for complex operations
- Development tooling for database inspection
- Production-ready performance characteristics

## Decision

We will use Prisma as our ORM and database toolkit for all database operations.

## Consequences

### Positive

- **Type Safety**: Prisma generates TypeScript types from our database schema, ensuring compile-time type checking for all database operations
- **Migration System**: Built-in migration system with version control integration and rollback capabilities
- **Developer Experience**: Prisma Studio provides a GUI for database inspection and manipulation during development
- **Repository Pattern**: Clean integration with our repository pattern through PrismaClient injection
- **Performance**: Query optimization through efficient SQL generation and connection pooling
- **Schema as Code**: Single source of truth in `prisma/schema.prisma` file
- **Testing Support**: Transaction rollback capabilities for integration testing

### Negative

- **Additional Build Step**: Requires `prisma generate` to update TypeScript types when schema changes
- **Learning Curve**: Team needs to learn Prisma-specific query syntax
- **Abstraction Layer**: Adds another layer between application and database
- **Migration Complexity**: Complex schema changes may require manual migration editing

## Implementation Details

### Architecture Integration

```
Application Layer (Commands/Queries)
        ↓
Repository Interfaces (Ports)
        ↓
Prisma Repositories (Adapters)
        ↓
PrismaClient → PostgreSQL
```

### Key Components

1. **PrismaService**: Extends PrismaClient, manages connection lifecycle
2. **PrismaModule**: NestJS module providing PrismaService globally
3. **Repository Implementations**: Use PrismaService for data access
4. **Unit of Work**: PrismaUnitOfWork for transaction management

### Migration Strategy

- Development: `npx prisma migrate dev` for iterative schema changes
- Production: `npx prisma migrate deploy` for applying migrations
- Testing: `npx prisma migrate reset --skip-seed` for clean test runs

## Alternatives Considered

### TypeORM

- **Pros**: Native NestJS integration, Active Record and Data Mapper patterns
- **Cons**: Less type safety, more complex configuration, migration issues reported

### MikroORM

- **Pros**: Unit of Work pattern, Identity Map, good TypeScript support
- **Cons**: Smaller community, less mature tooling, steeper learning curve

### Raw SQL with pg driver

- **Pros**: Maximum control, no abstraction overhead
- **Cons**: No type safety, manual migration management, more boilerplate code

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [NestJS Prisma Recipe](https://docs.nestjs.com/recipes/prisma)
- [Repository Pattern with Prisma](https://www.prisma.io/docs/concepts/components/prisma-client/crud#repository-pattern)
