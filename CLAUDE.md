# Project-Specific Instructions for Claude

## Quality Gates & CI/CD

### Local CI Pipeline

The project has a bulletproof, idempotent CI pipeline that mirrors GitHub Actions.

**Running the CI Pipeline:**

```bash
# Standard run (full infrastructure setup + all checks)
./scripts/ci-local.sh

# Quick mode (skip infrastructure if already healthy - faster!)
./scripts/ci-local.sh quick

# Clean mode (full environment reset before running)
./scripts/ci-local.sh clean
```

**What the CI Pipeline Does:**

1. **Infrastructure Setup** (PostgreSQL on port 55432, Redis on port 56379)
2. **Port Conflict Resolution** (automatically frees ports if needed)
3. **Database Setup** (creates database if missing, verifies connection)
4. **Database Migrations** (idempotent Prisma migrations)
5. **Quality Checks:**
   - ESLint with `--max-warnings 0` (zero tolerance)
   - TypeScript strict mode checking
   - Jest unit tests (must all pass)
6. **Smoke Tests** (optional - may fail without blocking CI)

### Quality Standards

- **ESLint**: Zero warnings policy, no `any` types, no `eslint-disable`
- **TypeScript**: Ultra-strict mode with `exactOptionalPropertyTypes`
- **Tests**: All tests must pass before any commit
- **Functions**: Max 30 lines, max complexity 8

### Database Migration Commands

```bash
# Deploy migrations (production-safe)
./scripts/db-migrate.sh deploy

# Development migrations (creates new if schema changed)
./scripts/db-migrate.sh dev

# Reset database (DESTRUCTIVE - asks for confirmation)
./scripts/db-migrate.sh reset

# Check migration status
./scripts/db-migrate.sh status
```

### Quick Quality Check

Before committing, always run:

```bash
npm run quality  # Runs lint + typecheck + tests
```

Or use the full CI pipeline:

```bash
./scripts/ci-local.sh quick  # Full CI with existing infrastructure
```

## Architecture Rules

### Clean Architecture Principles

1. **Controllers** → Handle HTTP only, no business logic
2. **Services** → Business logic only, no data access
3. **Repositories** → Database operations only, no business logic
4. **One file, one responsibility** - split if doing multiple things

### NestJS Patterns

- Use dependency injection properly
- Keep modules focused and bounded
- No circular dependencies between features
- Shared services for cross-feature communication

### Prisma Integration

- Repository pattern with `PrismaService`
- Unit of Work pattern for transactions
- Always use typed Prisma client
- Migrations are idempotent and safe

## Development Workflow

### Starting Development

```bash
# Start infrastructure (if not running)
./scripts/ci-local.sh

# Run in quick mode for subsequent runs
./scripts/ci-local.sh quick
```

### Before Committing

1. Run quality checks: `npm run quality`
2. Ensure all tests pass
3. Fix any ESLint warnings (zero tolerance)
4. Verify TypeScript compilation

### Port Configuration

- PostgreSQL: `55432` (not default 5432)
- Redis: `56379` (not default 6379)
- Backend API: `3001`
- Frontend: `3000`

This avoids conflicts with other local services.
