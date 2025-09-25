# Unified Knowledge Platform

Self-hosted knowledge management with voice control, AI processing, and home automation.

## Quick Start

```bash
# Clone and start
git clone <repo-url>
cd unified-knowledge-platform
docker compose up -d

# Access app
open http://localhost:3000
```

## What It Does

- 📝 **Knowledge**: Tasks, projects, notes with AI search
- 📦 **Inventory**: QR code tracking, locations, maintenance
- 🍽️ **Food**: Recipes, meal plans, expiration alerts
- 📅 **Calendar**: Time blocking, smart scheduling
- 💬 **Communication**: SMS/email integration and automation
- 🎤 **Voice**: "Add milk to shopping list", speech-to-text notes
- 🏠 **Home**: Smart device control and automation

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Ultra-strict quality gates (ALL must pass)
npm run lint --max-warnings 0
npm run test:unit
npm run test:integration
npm run typecheck

# Generate code (ALWAYS use NestJS CLI)
nest generate module <context-name>
nest generate service <context-name>/domain/<entity> --flat
nest generate controller <context-name>/infrastructure/<entity> --flat
```

## Key URLs

- **App**: http://localhost:3000
- **API Docs**: http://localhost:8000/api
- **Database**: postgresql://localhost:5432/knowledge
- **Redis**: redis://localhost:6379

## Stack

- **Backend**: NestJS + TypeScript + PostgreSQL + Redis
- **Frontend**: Next.js + PWA
- **AI**: Ollama + Whisper + PaddleOCR
- **Deploy**: Docker Compose

## Configuration

Environment presets live in the repo root:

- `.env.development` – default local machine values
- `.env.dev-container` – defaults tuned for Docker development containers
- `.env.testing` – isolated settings for automated tests
- `.env.staging` – template for staging deployments (override secrets in CI)
- `.env.example` – reference for creating new environment files

Create a private `.env` (local) or `.env.production` (deployment) for sensitive overrides; both are gitignored.

Key variables to set:

- App: `NODE_ENV`, `PORT`, `API_PREFIX`, `CORS_ORIGINS`, `LOG_LEVEL`, `LOG_FORMAT`
- Database: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_URL`
- Redis: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Security: `JWT_SECRET`, `SESSION_SECRET`, `API_KEY`
- Ports: `BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`, `NGINX_HOST_PORT`, `POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`

## Docker Orchestration

Container assets live under `docker/` (multi-stage images) and `nginx/` (routing). Use the helper scripts in `scripts/` to launch stacks with environment-specific compose overrides:

```bash
# Development (defaults to .env.development)
scripts/dev.sh              # up -d

# Alternative environments
scripts/test.sh up          # uses .env.testing
scripts/staging.sh up       # uses .env.staging
scripts/prod.sh up -d       # expects a private .env.production

# Pass through docker compose commands
scripts/dev.sh logs backend
scripts/prod.sh down
```

Compose layers:

- `docker-compose.yml` – core services (Postgres, Redis, backend, frontend, nginx)
- `docker-compose.dev.yml` – watch mode commands and developer ports
- `docker-compose.test.yml` – testing profile without public exposure
- `docker-compose.staging.yml` – staging host port mappings & nginx routes
- `docker-compose.prod.yml` – production routes (supply secrets via `.env.production`)

Preflight safety checks (enabled on `up`) ensure:

- `npm run quality` succeeds before containers start (use `--skip-quality` to bypass)
- Host ports defined in `.env.*` are free (`--skip-port-check` to override)
- Existing UKP containers are reported before reusing names (`--skip-container-check`)

Persistent data mounts into `storage/`. Replace the placeholder nginx configs in `nginx/conf.d/*.conf` and certificate stubs in `nginx/ssl/` when wiring external hosts.

## Documentation

- **[Architecture Guide](dev-docs/ARCHITECTURE.md)** - Code organization & development rails
- **[Deployment Guide](dev-docs/DEPLOYMENT.md)** - Docker setup & operations
- **[Product Requirements](dev-docs/PRD.md)** - Full system specification
- **[Tech Decisions](dev-docs/adr/)** - Architecture Decision Records

Event-driven hexagonal architecture with bounded contexts.# jms-pkm
