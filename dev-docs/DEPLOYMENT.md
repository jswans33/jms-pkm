# Deployment

## Quick Deploy

```bash
# Production
docker compose -f docker-compose.prod.yml up -d

# Development
docker compose up -d
```

## Environment Setup

```bash
# Copy and configure
cp .env.example .env
```

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/knowledge
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-other-secret

# File Storage
UPLOAD_PATH=/app/data/files
MAX_FILE_SIZE=50MB
```

### Optional External Services

```env
# SMS/Voice (optional)
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token

# Email (optional)
SENDGRID_API_KEY=your-sendgrid-key

# Calendar Sync (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Home Assistant (optional)
HOME_ASSISTANT_URL=http://your-ha-instance:8123
HOME_ASSISTANT_TOKEN=your-long-lived-token
```

## Docker Services

```yaml
# docker-compose.yml structure:
services:
  backend: # NestJS API (port 3000 inside container)
  frontend: # Next.js application
  postgres: # PostgreSQL 16
  redis: # Redis 7
  nginx: # Reverse proxy / health entrypoint
```

## Data Persistence

```bash
# Volumes created automatically:
docker volume ls
# knowledge_db_data      - PostgreSQL data
# knowledge_redis_data   - Redis persistence
# knowledge_files        - Uploaded files
# knowledge_models       - AI models cache
```

## Backup Strategy

```bash
# Database backup
docker exec knowledge_db pg_dump -U postgres knowledge > backup.sql

# File backup
tar -czf files-backup.tar.gz ./data/files

# Restore database
docker exec -i knowledge_db psql -U postgres knowledge < backup.sql
```

## Health Checks

```bash
# Check all services
docker compose ps

# Backend health (direct)
curl http://localhost:4001/api/health/config

# Proxy health (nginx)
curl http://localhost:3080/api/health/config

# Tail logs
docker compose logs -f backend
docker compose logs -f nginx
```

### Automated Smoke Test

- Local: run `./scripts/smoke.sh dev` to spin up the dev stack and verify `/api/health/config` end-to-end.
- CI: `.github/workflows/ci.yml` executes the same smoke script on every push/PR and tears the stack down afterwards.

## Troubleshooting

### App won't start

```bash
# Check environment
docker compose config

# Reset everything
docker compose down -v
docker compose up -d
```

### Database issues

```bash
# Connect to DB
docker exec -it knowledge_db psql -U postgres knowledge

# Check migrations
npm run migration:show
```

### AI services not responding

```bash
# Check Ollama
curl http://localhost:11434/api/tags

# Restart AI services
docker compose restart ai-services
```

## Performance Tuning

### PostgreSQL (16GB+ servers)

```env
# Increase shared buffers
POSTGRES_SHARED_BUFFERS=4GB
POSTGRES_EFFECTIVE_CACHE_SIZE=12GB
```

### Redis Memory

```env
# Limit Redis memory usage
REDIS_MAXMEMORY=2GB
REDIS_MAXMEMORY_POLICY=allkeys-lru
```

## Monitoring

```bash
# Resource usage
docker stats

# Service health
curl http://localhost:8000/health
curl http://localhost:3000/api/health
```

## Updates

```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d

# Clean old images
docker image prune
```
