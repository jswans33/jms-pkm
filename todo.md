# Prisma Integration Roadmap

## Phase 1 – Toolchain Bootstrap

- [x] Add dependencies: `npm install --save @prisma/client` + `npm install --save-dev prisma`
- [x] Initialize workspace: `npx prisma init --datasource-provider postgresql`
- [x] Confirm generated files align with repo layout (e.g. keep `prisma/schema.prisma` under version control)
- [x] Run `npm run quality` to ensure the new toolchain doesn't break existing gates

## Phase 2 – Environment Wiring

- [x] Add `DATABASE_URL` to `.env.development`, `.env.dev-container`, `.env.testing`, `.env.staging`, `.env.production`
- [x] Update `ApplicationConfigService` to surface the URL and fall back to individual fields when absent
- [x] Sync docker-compose Postgres credentials with env defaults (user, password, db name)
- [x] Execute `npm run quality` to validate type checks and tests after config updates

## Phase 3 – NestJS Prisma Module

- [x] Create `apps/backend/src/shared/infrastructure/prisma/prisma.service.ts` extending `PrismaClient`
- [x] Register `PrismaModule` that exports the service for injection
- [x] Implement graceful shutdown hooks (`enableShutdownHooks`) and optional logging configuration
- [x] Run `npm run quality` once the module is in place

## Phase 4 – Repository Pattern Implementation

- [x] Define base repository contracts in `apps/backend/src/shared/domain/repository.interface.ts`
- [x] For each context, add application-layer ports (e.g. `users/application/ports/user.repository.interface.ts`)
- [x] Implement Prisma-backed repositories under `context/infrastructure/repositories/`
- [x] Introduce a `PrismaUnitOfWork` helper for multi-repository transactions
- [x] Run `npm run quality` after repositories compile to catch contract drift

## Phase 5 – Strategy Pattern Gateway

- [x] Identify behaviors requiring runtime selection (auth providers, notification channels, etc.)
- [x] Model strategy interfaces in domain/application layers (`AuthStrategy`, `NotificationStrategy`, …)
- [x] Implement concrete strategies + resolver factory under `shared/infrastructure/strategies/`
- [x] Cover resolver fallbacks with unit tests
- [x] Re-run `npm run quality`

## Phase 6 – User Domain Kickoff

- [x] Generate `users` bounded context skeleton via Nest CLI (module, controller, service placeholders)
- [x] Add `users/domain/entities/user.entity.ts` and supporting value objects (user id, email)
- [x] Define application commands/handlers (CreateUser, ActivateUser) and their ports
- [x] Map Prisma models to domain entities via dedicated mappers
- [x] Execute `npm run quality` to enforce lint/tests/typecheck

## Phase 7 – Database Schema & Migrations

- [x] Model initial Prisma schema (User table plus related indexes/constraints)
- [x] Run `npx prisma migrate dev` for local development; capture SQL artifacts in version control
- [x] Add CI command `npx prisma migrate deploy` prior to backend startup
- [x] Regenerate Prisma client (`npx prisma generate`) whenever schema changes
- [x] Validate with `npm run quality`

## Phase 8 – Seeding Strategy

- [x] Create context-aware seeds (e.g. `prisma/seeds/users.seed.ts`) exporting idempotent `run(prisma)` functions
- [x] Orchestrate seeds via `prisma/seed.ts` and expose scripts: `seed:dev`, `seed:test`, `seed:reset`
- [x] Allow env-driven overrides (`SEED_USER_EMAIL`, etc.) for CI/local differences
- [x] Document seed extension guidelines
- [x] Run `npm run quality`

## Phase 9 – Testing Enhancements

- [ ] Stand up Prisma-powered integration tests with transactional rollbacks per spec
- [ ] Add domain factories/builders for deterministic test data (`users/testing/user.factory.ts`)
- [ ] Update test pipeline to execute `prisma migrate reset --force --skip-seed` before suites
- [ ] Introduce repository contract tests covering interface compliance
- [ ] Ensure CI splits unit/integration/e2e layers and re-run `npm run quality`

## Phase 10 – Documentation & Observability

- [ ] Update `dev-docs/DEPLOYMENT.md`, `README.md`, and `.env.example` with Prisma instructions
- [ ] Add architecture notes on repository/strategy patterns and how contexts should adopt them
- [ ] Document Prisma Studio usage (`npx prisma studio`) and troubleshooting tips (pool timeouts, logging)
- [ ] Consider monitoring/alerting additions (query logging toggles, pooling guidance)
- [ ] Final `npm run quality` pass after docs/scripts land
