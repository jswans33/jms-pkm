# Health Checks Overview

## Backend API

- `/api/health/config` is served by `HealthController` in `apps/backend/src/health/`.
- Endpoint verifies PostgreSQL and Redis via TCP probes before returning `{ "status": "ok" }`.
- Implementation lives in `HealthModule`, which is imported by `AppModule`.

## Frontend + Nginx

- Environment-specific Nginx configs now live in `nginx/env/` and are mounted per compose profile.
- Nginx uses an internal resolver and shared upstream zones so containers can recycle without 502s.
- `scripts/smoke.sh` checks backend health directly and validates service states before polling Nginx.

## Local Development Notes

- `docker/frontend/Dockerfile` now uses Debian-based `node:20.11` for Turbopack compatibility.
- `scripts/orchestrate.sh` rebuilds backend dist assets automatically across all environments and clears stale `dist` directories using the backend container if necessary.
- Run `./scripts/smoke.sh dev` after orchestration changes; the script exits early if any service is down.
