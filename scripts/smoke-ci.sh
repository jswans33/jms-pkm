#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# CI Smoke Test - Infrastructure Only
# =============================================================================
# Lightweight smoke test that validates infrastructure is running correctly
# Does NOT require backend to be running (tests already validate that)
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo "[smoke-ci] $1"; }
success() { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}" >&2; }

# Check PostgreSQL
check_postgres() {
  local port=55432
  log "Checking PostgreSQL on port $port..."

  if docker ps --format '{{.Names}}' | grep -q "jms-pkm-postgres"; then
    # Check container health
    local health=$(docker inspect --format='{{.State.Health.Status}}' jms-pkm-postgres 2>/dev/null)
    if [[ "$health" == "healthy" ]]; then
      success "PostgreSQL container is healthy"

      # Verify we can connect
      if docker exec jms-pkm-postgres pg_isready -U postgres >/dev/null 2>&1; then
        success "PostgreSQL is accepting connections"
        return 0
      else
        error "PostgreSQL container exists but not accepting connections"
        return 1
      fi
    else
      error "PostgreSQL container is not healthy (status: $health)"
      return 1
    fi
  else
    error "PostgreSQL container not found"
    return 1
  fi
}

# Check Redis
check_redis() {
  local port=56379
  log "Checking Redis on port $port..."

  if docker ps --format '{{.Names}}' | grep -q "jms-pkm-redis"; then
    # Check container health
    local health=$(docker inspect --format='{{.State.Health.Status}}' jms-pkm-redis 2>/dev/null)
    if [[ "$health" == "healthy" ]]; then
      success "Redis container is healthy"

      # Verify we can ping
      if docker exec jms-pkm-redis redis-cli ping >/dev/null 2>&1; then
        success "Redis is responding to pings"
        return 0
      else
        error "Redis container exists but not responding"
        return 1
      fi
    else
      error "Redis container is not healthy (status: $health)"
      return 1
    fi
  else
    error "Redis container not found"
    return 1
  fi
}

# Check database exists
check_database() {
  log "Checking if database 'ukp_development' exists..."

  if docker exec jms-pkm-postgres psql -U postgres -lqt | cut -d \| -f 1 | grep -qw ukp_development; then
    success "Database 'ukp_development' exists"

    # Test we can query it
    if docker exec jms-pkm-postgres psql -U postgres -d ukp_development -c "SELECT 1;" >/dev/null 2>&1; then
      success "Database is queryable"
      return 0
    else
      error "Database exists but cannot query it"
      return 1
    fi
  else
    error "Database 'ukp_development' not found"
    return 1
  fi
}

# Main
main() {
  log "Starting infrastructure smoke tests..."

  failed=0

  # Check each infrastructure component
  if ! check_postgres; then
    failed=$((failed + 1))
  fi

  if ! check_redis; then
    failed=$((failed + 1))
  fi

  if ! check_database; then
    failed=$((failed + 1))
  fi

  # Summary
  if [[ $failed -gt 0 ]]; then
    error "Infrastructure smoke tests failed with $failed errors"
    exit 1
  else
    success "All infrastructure smoke tests passed! Infrastructure is bulletproof! 🚀"
    exit 0
  fi
}

main "$@"