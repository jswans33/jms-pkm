# Database Seeding Documentation

## Overview

The seeding system provides a robust, environment-aware mechanism for populating the database with initial and test data. It follows idempotent principles to ensure safe re-runs and supports multiple environments with tailored datasets.

## Architecture

### Directory Structure

```
prisma/
├── seeds/
│   ├── README.md               # This documentation
│   ├── base.seeder.ts          # Abstract base class for all seeders
│   └── users.seed.ts           # User domain seeder
├── seed.ts                     # Main orchestrator
└── schema.prisma              # Database schema
```

### Core Components

#### 1. Base Seeder (`base.seeder.ts`)

Abstract class providing common functionality for all domain seeders:

- **Environment detection**: Automatically detects current NODE_ENV
- **Logging utilities**: Standardized console output with context
- **Idempotency helpers**: Methods to check existence before creation
- **Transaction support**: Built-in Prisma client handling

#### 2. Domain Seeders

Each domain (Users, Projects, Tasks, etc.) has its own seeder that:

- Extends the `BaseSeeder` class
- Implements environment-specific data generation
- Ensures idempotent operations
- Provides clear logging of operations

#### 3. Seed Orchestrator (`seed.ts`)

Main entry point that:

- Coordinates all domain seeders
- Handles database connections
- Provides error handling and recovery
- Manages seed execution order

## Usage

### Running Seeds

```bash
# Seed for development environment
npm run seed:dev

# Seed for testing environment
npm run seed:test

# Seed for staging environment
npm run seed:staging

# Reset database and re-seed
npm run seed:reset

# Reset database without seeding
npm run seed:clean
```

### Environment-Specific Data

Each environment receives different seed data:

#### Development (`NODE_ENV=development`)

- Full set of sample users with various statuses
- Rich test data for all features
- Admin and regular user accounts
- Sample data across all domains

#### Testing (`NODE_ENV=testing`)

- Minimal set focused on test scenarios
- Known users for authentication tests
- Predictable data for assertions
- Clean slate for test isolation

#### Staging (`NODE_ENV=staging`)

- Production-like data structure
- Limited sample data
- Focus on system validation
- Admin accounts for testing

## Extending the Seeding System

### Adding a New Domain Seeder

1. **Create the seeder file** in `prisma/seeds/`:

```typescript
// prisma/seeds/projects.seed.ts
import { PrismaClient } from '@prisma/client';

import { BaseSeeder } from './base.seeder';

class ProjectSeeder extends BaseSeeder {
  public async seed(): Promise<void> {
    const environment = this.getEnvironment();
    this.log(`Seeding projects for ${environment} environment`);

    if (environment === 'development') {
      await this.seedDevelopmentProjects();
    } else if (environment === 'testing') {
      await this.seedTestingProjects();
    } else if (environment === 'staging') {
      await this.seedStagingProjects();
    }
  }

  private async seedDevelopmentProjects(): Promise<void> {
    const projects = [
      { name: 'Project Alpha', status: 'active' },
      { name: 'Project Beta', status: 'planning' },
    ];

    for (const project of projects) {
      const exists = await this.exists(this.prisma.project, { name: project.name });

      if (!exists) {
        await this.prisma.project.create({ data: project });
        this.log(`Created project: ${project.name}`);
      }
    }
  }

  // Implement other environment methods...
}

export async function seedProjects(prisma: PrismaClient): Promise<void> {
  const seeder = new ProjectSeeder(prisma);
  await seeder.seed();
}
```

2. **Register in the orchestrator** (`prisma/seed.ts`):

```typescript
import { seedProjects } from './seeds/projects.seed';

async function main(): Promise<void> {
  // Existing seeders
  await seedUsers(prisma);

  // Add new seeder
  await seedProjects(prisma);
}
```

### Environment Variable Overrides

Control seeding behavior with environment variables:

```bash
# Skip certain domains
SKIP_USER_SEED=true npm run seed:dev

# Use verbose logging
SEED_VERBOSE=true npm run seed:dev

# Custom seed count
SEED_USER_COUNT=100 npm run seed:dev
```

### Implementing Idempotency

Always check for existing data before creating:

```typescript
// Good - Idempotent
const exists = await this.exists(this.prisma.user, { email });
if (!exists) {
  await this.prisma.user.create({ data: userData });
}

// Bad - Will fail on re-run
await this.prisma.user.create({ data: userData });
```

## Testing Infrastructure Integration

The seeding system integrates with the testing infrastructure:

### Test Factories

Located in `apps/backend/src/[domain]/testing/`:

- **Factory Pattern**: Quick object creation with defaults
- **Builder Pattern**: Fluent interface for complex objects
- **Object Mother**: Pre-configured common scenarios

### Using Test Patterns in Seeds

```typescript
import { UserMother } from '@backend/users/testing/user.mother';

// In seeder
const testUser = UserMother.activeUser();
await this.prisma.user.create({
  data: this.mapToDbSchema(testUser),
});
```

## Best Practices

### 1. Always Be Idempotent

- Check existence before creation
- Use unique constraints wisely
- Handle partial seed states gracefully

### 2. Environment Awareness

- Different data per environment
- Production-like data in staging
- Minimal data in testing

### 3. Clear Logging

- Log what's being created
- Report skipped items
- Provide summary statistics

### 4. Transaction Safety

- Use transactions for related data
- Rollback on partial failures
- Maintain data consistency

### 5. Performance Considerations

- Batch operations when possible
- Use upsert for large datasets
- Consider parallel seeding for independent domains

## Troubleshooting

### Common Issues

#### Duplicate Key Errors

**Problem**: Seed fails with unique constraint violation

**Solution**: Ensure idempotent checks are in place:

```typescript
const exists = await this.exists(model, { uniqueField: value });
if (!exists) {
  await model.create({ data });
}
```

#### Environment Detection Issues

**Problem**: Wrong data being seeded

**Solution**: Verify NODE_ENV is set correctly:

```bash
# Check current environment
echo $NODE_ENV

# Set explicitly
export NODE_ENV=development
npm run seed:dev
```

#### Connection Timeouts

**Problem**: Seed fails with connection errors

**Solution**: Ensure database is running and accessible:

```bash
# Check database status
npx prisma db push

# Verify connection string
cat .env | grep DATABASE_URL
```

### Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Run with debug output
DEBUG=prisma:* npm run seed:dev

# Custom verbose flag
SEED_VERBOSE=true npm run seed:dev
```

## Security Considerations

### Password Handling

- Never store plain text passwords
- Use bcrypt with appropriate rounds
- Different passwords per environment

### Sensitive Data

- No real user data in seeds
- Use fake data generators
- Sanitize any production copies

### Access Control

- Limit seed commands to development
- Protect production databases
- Use environment-specific credentials

## Migration Compatibility

Seeds must remain compatible with schema migrations:

1. Update schema first
2. Adjust seeders to match
3. Test with fresh database
4. Document breaking changes

## Future Enhancements

Planned improvements to the seeding system:

- [ ] Parallel seeding for independent domains
- [ ] Seed data validation
- [ ] Import/export seed datasets
- [ ] GUI for seed management
- [ ] Automated seed testing
- [ ] Performance benchmarking
- [ ] Seed data generators
- [ ] Cross-domain relationships

## Contributing

When contributing to the seeding system:

1. Follow the established patterns
2. Ensure idempotency
3. Add appropriate tests
4. Update this documentation
5. Test in all environments

## References

- [Prisma Seeding Documentation](https://www.prisma.io/docs/guides/database/seed-database)
- [Test Data Patterns](https://martinfowler.com/bliki/ObjectMother.html)
- [Idempotent Operations](https://en.wikipedia.org/wiki/Idempotence)
