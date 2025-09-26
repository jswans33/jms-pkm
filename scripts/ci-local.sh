#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Local CI Pipeline - Bulletproof & Idempotent
# =============================================================================
# Mirrors GitHub Actions workflow with proper separation of concerns
# Usage: ./scripts/ci-local.sh [clean|quick]
#   clean - Full reset of environment before running
#   quick - Skip infrastructure setup if already running
# =============================================================================

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
POSTGRES_PORT=55432
REDIS_PORT=56379
POSTGRES_CONTAINER="jms-pkm-postgres"
REDIS_CONTAINER="jms-pkm-redis"
DB_NAME="ukp_development"
DB_USER="postgres"
DB_PASS="postgres"
HEALTH_TIMEOUT=60

# -----------------------------------------------------------------------------
# Output Helpers
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[CI] $1${NC}"; }
success() { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠ $1${NC}"; }
error() { echo -e "${RED}✗ $1${NC}" >&2; exit 1; }

# -----------------------------------------------------------------------------
# Cleanup Handler
# -----------------------------------------------------------------------------
cleanup() {
    local exit_code=$?

    if [ "${SKIP_CLEANUP:-}" != "true" ]; then
        log "Cleaning up infrastructure..."
        docker rm -f "$POSTGRES_CONTAINER" "$REDIS_CONTAINER" 2>/dev/null || true
    fi

    if [ $exit_code -eq 0 ]; then
        success "CI pipeline completed successfully"
    else
        error "CI pipeline failed with exit code $exit_code"
    fi
}

trap cleanup EXIT

# -----------------------------------------------------------------------------
# Infrastructure Management
# -----------------------------------------------------------------------------
free_port() {
    local port=$1
    local service=$2

    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        warn "Port $port in use for $service, attempting to free..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        docker ps --format '{{.Names}}' | xargs -r docker inspect | \
            grep -l ":$port" | xargs -r docker stop 2>/dev/null || true
        sleep 1

        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            error "Cannot free port $port for $service"
        fi
    fi
}

remove_existing_containers() {
    local containers=("$@")
    for container in "${containers[@]}"; do
        if docker ps -a --format '{{.Names}}' | grep -q "^${container}$"; then
            docker rm -f "$container" 2>/dev/null || true
        fi
    done
}

wait_for_health() {
    local container=$1
    local service=$2
    local elapsed=0

    while [ $elapsed -lt $HEALTH_TIMEOUT ]; do
        if [ "$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)" = "healthy" ]; then
            success "$service is healthy"
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done

    error "$service failed to become healthy within ${HEALTH_TIMEOUT}s"
}

start_infrastructure() {
    log "Starting infrastructure services..."

    # PostgreSQL
    docker run -d \
        --name "$POSTGRES_CONTAINER" \
        --health-cmd="pg_isready -U $DB_USER" \
        --health-interval=5s \
        --health-timeout=3s \
        --health-retries=10 \
        -e POSTGRES_DB="$DB_NAME" \
        -e POSTGRES_USER="$DB_USER" \
        -e POSTGRES_PASSWORD="$DB_PASS" \
        -p "$POSTGRES_PORT:5432" \
        postgres:14-alpine > /dev/null

    # Redis
    docker run -d \
        --name "$REDIS_CONTAINER" \
        --health-cmd="redis-cli ping" \
        --health-interval=5s \
        --health-timeout=3s \
        --health-retries=10 \
        -p "$REDIS_PORT:6379" \
        redis:7-alpine > /dev/null

    wait_for_health "$POSTGRES_CONTAINER" "PostgreSQL"
    wait_for_health "$REDIS_CONTAINER" "Redis"
}

# -----------------------------------------------------------------------------
# Database Setup
# -----------------------------------------------------------------------------
setup_database() {
    log "Setting up database..."

    # Check if DB exists
    if ! docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -lqt | \
         cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        docker exec "$POSTGRES_CONTAINER" createdb -U "$DB_USER" "$DB_NAME"
        success "Database created"
    else
        log "Database already exists"
    fi

    # Verify connection
    docker exec "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
        -c "SELECT 1;" > /dev/null || error "Database connection failed"
}

run_migrations() {
    log "Running database migrations..."
    ./scripts/db-migrate.sh deploy
}

run_seeds() {
    log "Seeding database..."
    npm run seed:dev >/tmp/ci-seed.log 2>&1 || {
        cat /tmp/ci-seed.log >&2 || true
        error "Database seeding failed"
    }
    success "Database seeding completed"
}

# -----------------------------------------------------------------------------
# Quality Gates
# -----------------------------------------------------------------------------
run_quality_checks() {
    log "Running quality checks..."

    # Lint
    log "ESLint check..."
    npm run lint

    # Type check
    log "TypeScript check..."
    npm run typecheck

    # Tests
    log "Running tests..."
    npm run test
}

run_smoke_tests() {
    log "Running infrastructure smoke tests..."

    # Run infrastructure-only smoke tests (backend not required)
    if ./scripts/smoke-ci.sh; then
        success "Smoke tests passed"
    else
        error "Smoke tests failed - this is a broken window!"
    fi
}

# -----------------------------------------------------------------------------
# Main Pipeline
# -----------------------------------------------------------------------------
main() {
    local mode="${1:-normal}"

    cd "$(dirname "${BASH_SOURCE[0]}")/.."

    log "Starting CI pipeline (mode: $mode)..."

    case "$mode" in
        clean)
            log "Clean mode: Full environment reset"
            docker stop $(docker ps -q) 2>/dev/null || true
            docker rm $(docker ps -aq) 2>/dev/null || true
            ;;
        quick)
            log "Quick mode: Skipping infrastructure if healthy"
            SKIP_CLEANUP=true

            # Check if containers are already healthy
            if docker ps --format '{{.Names}}' | grep -q "$POSTGRES_CONTAINER" && \
               docker ps --format '{{.Names}}' | grep -q "$REDIS_CONTAINER" && \
               [ "$(docker inspect --format='{{.State.Health.Status}}' "$POSTGRES_CONTAINER" 2>/dev/null)" = "healthy" ] && \
               [ "$(docker inspect --format='{{.State.Health.Status}}' "$REDIS_CONTAINER" 2>/dev/null)" = "healthy" ]; then
                log "Infrastructure already running and healthy"
            else
                # Need to set up infrastructure
                free_port $POSTGRES_PORT "PostgreSQL"
                free_port $REDIS_PORT "Redis"
                remove_existing_containers "$POSTGRES_CONTAINER" "$REDIS_CONTAINER"
                start_infrastructure
                setup_database
            fi
            ;;
        *)
            # Normal mode
            free_port $POSTGRES_PORT "PostgreSQL"
            free_port $REDIS_PORT "Redis"
            remove_existing_containers "$POSTGRES_CONTAINER" "$REDIS_CONTAINER"
            start_infrastructure
            setup_database
            ;;
    esac

    # Always run these steps
    run_migrations
    run_seeds
    run_quality_checks
    run_smoke_tests

    success "All CI checks passed! 🚀"
}

# -----------------------------------------------------------------------------
# Entry Point
# -----------------------------------------------------------------------------
main "$@"
