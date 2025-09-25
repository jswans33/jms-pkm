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

## Documentation

- **[Architecture Guide](dev-docs/ARCHITECTURE.md)** - Code organization & development rails
- **[Deployment Guide](dev-docs/DEPLOYMENT.md)** - Docker setup & operations
- **[Product Requirements](dev-docs/PRD.md)** - Full system specification
- **[Tech Decisions](dev-docs/adr/)** - Architecture Decision Records

Event-driven hexagonal architecture with bounded contexts.# jms-pkm
