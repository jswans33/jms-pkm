#!/bin/bash
set -euo pipefail

# Database Migration Script - Idempotent and Bulletproof
# Usage: ./scripts/db-migrate.sh [dev|deploy|reset|status]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PRISMA_DIR="$PROJECT_ROOT/prisma"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if database is reachable
check_database_connection() {
    log "Checking database connection..."

    local max_retries=30
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if npx prisma db execute --schema prisma/schema.prisma --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
            success "Database connection established"
            return 0
        fi

        retry_count=$((retry_count + 1))
        warn "Database connection attempt $retry_count/$max_retries failed. Retrying in 2s..."
        sleep 2
    done

    error "Could not establish database connection after $max_retries attempts"
}

# Check migration status
check_migration_status() {
    log "Checking migration status..."
    npx prisma migrate status
}

# Deploy migrations (idempotent)
deploy_migrations() {
    log "Deploying migrations..."

    # Check if _prisma_migrations table exists
    if ! npx prisma db execute --schema prisma/schema.prisma --stdin <<< "SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations';" >/dev/null 2>&1; then
        log "First-time setup detected. Creating migration history..."
    fi

    # Deploy migrations idempotently
    npx prisma migrate deploy
    success "Migrations deployed successfully"
}

# Development migrations (with drift detection)
dev_migrations() {
    log "Running development migrations..."

    # Check for schema drift
    if ! npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma >/dev/null 2>&1; then
        log "Schema drift detected. Creating new migration..."
        npx prisma migrate dev --name "auto_generated_$(date +%s)"
    else
        log "No schema changes detected. Ensuring migrations are applied..."
        npx prisma migrate deploy
    fi

    success "Development migrations completed"
}

# Reset database (destructive)
reset_database() {
    warn "This will DESTROY all data in the database!"
    read -p "Are you sure? Type 'yes' to continue: " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        log "Operation cancelled"
        exit 0
    fi

    log "Resetting database..."
    npx prisma migrate reset --force --skip-seed
    success "Database reset completed"
}

# Generate Prisma client (idempotent)
generate_client() {
    log "Generating Prisma client..."
    npx prisma generate
    success "Prisma client generated"
}

# Main execution
main() {
    local command="${1:-status}"

    # Change to project root
    cd "$PROJECT_ROOT"

    # Load environment variables
    if [ -f ".env.development" ]; then
        log "Loading environment from .env.development"
        export $(cat .env.development | grep -v '^#' | xargs)
    fi

    # Ensure DATABASE_URL is set
    if [ -z "${DATABASE_URL:-}" ]; then
        error "DATABASE_URL environment variable is not set"
    fi

    case "$command" in
        "dev")
            check_database_connection
            dev_migrations
            generate_client
            ;;
        "deploy")
            check_database_connection
            deploy_migrations
            generate_client
            ;;
        "reset")
            check_database_connection
            reset_database
            generate_client
            ;;
        "status")
            check_database_connection
            check_migration_status
            ;;
        *)
            error "Unknown command: $command. Use: dev|deploy|reset|status"
            ;;
    esac

    success "Database operation '$command' completed successfully"
}

# Run main function
main "$@"