# Management Script Feature Specification

## Overview
Single entry point bash script (`./app`) for all application lifecycle operations.

## Requirements

### Functional Requirements
- **FR-001**: Provide unified interface for all application operations
- **FR-002**: Self-documenting help system (`./app help`)
- **FR-003**: Environment detection (dev/prod) with appropriate defaults
- **FR-004**: Colored output for better readability
- **FR-005**: Progress indicators for long-running operations
- **FR-006**: Graceful error handling with meaningful messages

### Non-Functional Requirements
- **NFR-001**: Commands must be idempotent (safe to run multiple times)
- **NFR-002**: Script must fail fast with clear error messages
- **NFR-003**: All operations must complete in reasonable time (<30s for most)
- **NFR-004**: Must work on Ubuntu 22.04+ and macOS
- **NFR-005**: Zero external dependencies beyond standard Unix tools

## Command Interface

### Lifecycle Management
```bash
./app start           # Start full application stack
./app stop            # Stop all services gracefully
./app restart         # Stop and start
./app status          # Show service status
./app logs            # Follow logs for all services
./app logs [service]  # Follow logs for specific service
```

### Development Workflow
```bash
./app install         # Install all dependencies
./app dev             # Start in development mode with hot reload
./app test            # Run full test suite (unit + integration + e2e)
./app test:unit       # Run unit tests only
./app test:e2e        # Run end-to-end tests
./app lint            # Run ESLint with --max-warnings 0
./app typecheck       # Run TypeScript compiler
./app quality         # Run all quality gates (lint + test + typecheck)
```

### Database Operations
```bash
./app db:migrate      # Run database migrations
./app db:seed         # Seed database with test data
./app db:backup       # Create timestamped database backup
./app db:restore [file] # Restore from backup file
./app db:reset        # Reset database (development only)
./app db:console      # Connect to PostgreSQL console
```

### Code Generation (NestJS CLI Integration)
```bash
./app generate:module <name>              # Generate bounded context module
./app generate:entity <context> <name>   # Generate entity with repository
./app generate:handler <context> <name>  # Generate command/query handler
./app generate:controller <context> <name> # Generate REST controller
```

### Production Operations
```bash
./app deploy         # Deploy to production environment
./app build          # Build all Docker containers
./app health         # Comprehensive health check
./app backup         # Full system backup (DB + files)
./app update         # Pull latest code and restart services
```

### Utilities & Troubleshooting
```bash
./app clean          # Clean Docker containers, volumes, images
./app reset          # Nuclear option - reset everything (with confirmation)
./app doctor         # System diagnostics and health check
./app shell          # Interactive shell in main app container
./app shell [service] # Interactive shell in specific service container
```

## Technical Specifications

### Script Structure
```bash
#!/bin/bash
set -euo pipefail

# Global configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$SCRIPT_DIR"
readonly COMPOSE_FILE="docker-compose.yml"
readonly COMPOSE_DEV_FILE="docker-compose.dev.yml"

# Color definitions
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color
```

### Environment Detection
```bash
detect_environment() {
    if [[ -f ".env.local" ]] || [[ "${NODE_ENV:-}" == "development" ]]; then
        echo "development"
    else
        echo "production"
    fi
}
```

### Logging Functions
```bash
log_info() {
    echo -e "${BLUE}[INFO]${NC} $*" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" >&2
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}
```

### Error Handling
```bash
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Command failed on line $line_number with exit code $exit_code"

    # Provide contextual help
    case $exit_code in
        125) log_error "Docker daemon not running. Try: sudo systemctl start docker" ;;
        127) log_error "Command not found. Check if Docker/Node.js is installed" ;;
        *) log_error "Unexpected error. Run './app doctor' for diagnostics" ;;
    esac

    exit $exit_code
}

trap 'handle_error $LINENO' ERR
```

### Help System
```bash
show_help() {
    cat << 'EOF'
Unified Knowledge Platform Management Script

USAGE:
    ./app <command> [options]

LIFECYCLE COMMANDS:
    start              Start the application stack
    stop               Stop all services
    restart            Restart all services
    status             Show service status
    logs [service]     Show logs for all or specific service

DEVELOPMENT COMMANDS:
    install            Install dependencies
    dev                Start development mode
    test               Run all tests
    test:unit          Run unit tests
    test:e2e           Run end-to-end tests
    lint               Run ESLint (strict mode)
    typecheck          Run TypeScript compiler
    quality            Run all quality gates

DATABASE COMMANDS:
    db:migrate         Run database migrations
    db:seed            Seed with test data
    db:backup          Create database backup
    db:restore <file>  Restore from backup
    db:reset           Reset database (dev only)
    db:console         Database console

GENERATION COMMANDS:
    generate:module <name>            Create bounded context
    generate:entity <ctx> <name>      Create entity
    generate:handler <ctx> <name>     Create handler
    generate:controller <ctx> <name>  Create controller

UTILITY COMMANDS:
    clean              Clean Docker resources
    reset              Reset everything (dangerous)
    doctor             Run system diagnostics
    shell [service]    Interactive shell
    health             Health check

Use './app <command> --help' for command-specific help.
EOF
}
```

## Implementation Phases

### Phase 1: Core Commands (Week 1)
- Basic lifecycle (start, stop, status, logs)
- Development workflow (install, dev, test, lint)
- Help system
- Error handling

### Phase 2: Database Operations (Week 1)
- Migration support
- Backup/restore functionality
- Development database reset

### Phase 3: Code Generation (Week 2)
- NestJS CLI integration
- Template-based generation
- Validation of generated code

### Phase 4: Production & Utilities (Week 2)
- Deployment commands
- Health checks
- System diagnostics
- Container utilities

## Success Criteria
- [ ] New developer can run full stack in <2 minutes using `./app start`
- [ ] All quality gates pass via `./app quality`
- [ ] Database operations work reliably
- [ ] Help system provides clear guidance
- [ ] Error messages are actionable
- [ ] Script works on Ubuntu and macOS
- [ ] Zero-downtime deployments via `./app deploy`

## Testing Strategy
- Unit tests for individual functions (bash testing framework)
- Integration tests with real Docker containers
- End-to-end tests simulating developer workflows
- Performance tests for command execution time
- Cross-platform testing (Ubuntu, macOS)

## Documentation
- Inline help system (`./app help`)
- Command-specific help (`./app [cmd] --help`)
- Error messages with suggested solutions
- Examples in README.md