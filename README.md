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

Copy `.env.example` to `.env` and configure:
- Database connection
- External API keys (Twilio, SendGrid)
- JWT secrets

## Documentation

- **[Architecture Guide](dev-docs/ARCHITECTURE.md)** - Code organization & development rails
- **[Deployment Guide](dev-docs/DEPLOYMENT.md)** - Docker setup & operations
- **[Product Requirements](dev-docs/PRD.md)** - Full system specification
- **[Tech Decisions](dev-docs/adr/)** - Architecture Decision Records

Event-driven hexagonal architecture with bounded contexts.# jms-pkm
