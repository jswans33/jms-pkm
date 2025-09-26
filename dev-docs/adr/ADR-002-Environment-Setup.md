# ADR-002: Environment Configuration Strategy

## Status

Accepted

## Date

2025-09-26

## Context

We need a consistent and secure approach to manage configuration across multiple environments (development, testing, staging, production) while:

- Preventing secrets from being committed to version control
- Supporting containerized and non-containerized deployments
- Enabling local development with minimal setup friction
- Maintaining environment parity to reduce "works on my machine" issues
- Supporting CI/CD pipelines with automated configuration

## Decision

We will use a layered environment configuration approach with `.env` files and environment-specific defaults.

## Configuration Hierarchy

### Environment Files Structure

```
.env                    # Local overrides (gitignored)
.env.development        # Development defaults (committed)
.env.testing           # Test environment config (committed)
.env.staging          # Staging environment config (committed)
.env.production       # Production config template (committed, no secrets)
.env.dev-container    # Docker development config (committed)
```

### Loading Priority (highest to lowest)

1. Process environment variables
2. `.env` (local overrides)
3. `.env.{NODE_ENV}` (environment-specific)
4. Application defaults

## Implementation Details

### Port Allocation Strategy

- **Backend API**: 3001 (local) / 4001 (Docker host)
- **Frontend**: 3000 (local) / 4002 (Docker host)
- **PostgreSQL**: 55432 (host mapping to 5432)
- **Redis**: 56379 (host mapping to 6379)
- **Nginx Proxy**: 4080 (Docker only)

### Database Configuration

```env
# Development
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/ukp_development?schema=public

# Testing (separate database)
DATABASE_URL=postgresql://postgres:postgres@localhost:55432/ukp_testing?schema=public

# Production (injected by deployment)
DATABASE_URL=${DATABASE_URL}
```

### Service Discovery

- Local development: Direct port connections
- Docker development: Container names with internal networking
- Production: Environment-injected URLs

## Security Considerations

### Committed Files

- Only contain non-sensitive defaults
- Production files serve as templates
- Secrets documented but not included

### Secrets Management

- Local: `.env` file (gitignored)
- CI/CD: GitHub Secrets / environment variables
- Production: Injected by deployment platform

### Required Secrets

```env
JWT_SECRET          # JWT signing key
SESSION_SECRET      # Session encryption key
API_KEY            # External API authentication
DATABASE_URL       # Production database connection
REDIS_PASSWORD     # Redis authentication (production)
```

## Consequences

### Positive

- **Clear Environment Separation**: Each environment has explicit configuration
- **Security by Default**: Secrets never committed
- **Local Development Ease**: Sensible defaults work out-of-the-box
- **Container Support**: Seamless Docker/native switching
- **CI/CD Ready**: Environment variables override files

### Negative

- **Multiple Files**: More configuration files to maintain
- **Synchronization**: Must keep environment files in sync
- **Documentation Burden**: Need to document all variables

## Migration Path

### For New Developers

1. Clone repository
2. Copy `.env.example` to `.env` (when we add it)
3. Run `npm install && npm run dev`
4. Services start with development defaults

### For Production Deployment

1. Set all required environment variables in deployment platform
2. Build and deploy application
3. Application uses injected configuration

## Best Practices

### DO

- ✅ Commit environment-specific defaults
- ✅ Document all environment variables in README
- ✅ Use descriptive variable names
- ✅ Validate required variables on startup
- ✅ Log configuration (excluding secrets) on startup

### DON'T

- ❌ Commit secrets or API keys
- ❌ Use production values in development defaults
- ❌ Hardcode environment-specific values in code
- ❌ Share `.env` files between developers

## References

- [12-Factor App: Config](https://12factor.net/config)
- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
