#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Unified orchestration entry point for all Docker environments.
#
# Usage:
#   scripts/orchestrate.sh [options] [dev|test|staging|prod] [docker compose args]
#
# Options:
#   --skip-quality         Skip `npm run quality` preflight (default runs on `up`)
#   --skip-port-check      Skip host port availability checks
#   --skip-container-check Skip warnings about already-running containers
#   -h, --help             Show usage info
#
# Examples:
#   scripts/orchestrate.sh                        # dev stack up -d (with preflight)
#   scripts/orchestrate.sh staging up             # staging stack
#   scripts/orchestrate.sh --skip-quality dev up  # skip quality checks
#   scripts/orchestrate.sh prod logs -f nginx     # follow production nginx logs
# -----------------------------------------------------------------------------
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

usage() {
  cat <<'USAGE'
Usage: scripts/orchestrate.sh [options] [environment] [docker compose args]

Environments:
  dev           Local development (default)
  test          Testing profile
  staging       Staging profile
  prod          Production profile

Options:
  --skip-quality         Skip npm run quality before `docker compose up`
  --skip-port-check      Skip host port availability checks
  --skip-container-check Skip warnings about already running containers
  -h, --help             Show this message

Examples:
  scripts/orchestrate.sh               # dev up -d (preflight enabled)
  scripts/orchestrate.sh staging up    # staging stack
  scripts/orchestrate.sh prod logs -f  # stream logs from production stack
USAGE
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

run_quality_check() {
  echo "[orchestrate] Running npm run quality..."
  npm run quality
  echo "[orchestrate] Quality checks passed"
}

ensure_backend_dist() {
  local dist_entry="apps/backend/dist/main.js"
  local build_info="apps/backend/tsconfig.build.tsbuildinfo"
  local dist_dir="apps/backend/dist"

  if [[ -f "$dist_entry" ]]; then
    return
  fi

  echo "[orchestrate] Backend dist missing; building backend workspace..."
  if [[ -d "$dist_dir" ]]; then
    if ! rm -rf "$dist_dir"; then
      echo "[orchestrate] Local cleanup failed; trying to remove dist via backend container" >&2
      docker compose run --rm backend sh -c 'rm -rf /app/apps/backend/dist' >/dev/null 2>&1 || true
      rm -rf "$dist_dir" || true
    fi
  fi
  if [[ -f "$build_info" ]]; then
    rm -f "$build_info"
  fi
  npm run build --workspace backend
  if [[ ! -f "$dist_entry" ]]; then
    echo "[orchestrate] Backend build did not produce ${dist_entry}; check Nest/TS config." >&2
    exit 1
  fi
  if [[ -f "$build_info" ]]; then
    rm -f "$build_info"
  fi
  echo "[orchestrate] Backend build complete"
}

check_port_free() {
  local port=$1
  local label=$2

  if command_exists lsof; then
    if lsof -iTCP:"$port" -sTCP:LISTEN -Pn >/dev/null 2>&1; then
      echo "[orchestrate] Port ${port} is already in use (${label})." >&2
      echo "[orchestrate] Use --skip-port-check to bypass or free the port before continuing." >&2
      exit 1
    fi
  elif command_exists ss; then
    if ss -tulwn | grep -q "[:.]${port}[[:space:]]"; then
      echo "[orchestrate] Port ${port} is already in use (${label})." >&2
      echo "[orchestrate] Use --skip-port-check to bypass or free the port before continuing." >&2
      exit 1
    fi
  else
    echo "[orchestrate] Warning: neither lsof nor ss available; skipping port check for ${label}." >&2
  fi
}

warn_running_container() {
  local name=$1
  if docker ps --format '{{.Names}}' | grep -qw "$name"; then
    echo "[orchestrate] Warning: container '${name}' already running." >&2
  fi
}

skip_quality=false
skip_port_check=false
skip_container_check=false

declare -a positional
declare -a passthrough

while [[ ${1-} == --* ]]; do
  case "$1" in
    --skip-quality)
      skip_quality=true
      ;;
    --skip-port-check)
      skip_port_check=true
      ;;
    --skip-container-check)
      skip_container_check=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

env_alias=${1:-dev}
if [[ "$env_alias" =~ ^(-h|--help)$ ]]; then
  usage
  exit 0
fi
shift || true

case "$env_alias" in
  dev)
    env_file=".env.dev-container"
    compose_overrides=("docker-compose.dev.yml")
    default_cmd=("up" "-d")
    ;;
  test)
    env_file=".env.testing"
    compose_overrides=("docker-compose.test.yml")
    default_cmd=("up" "-d")
    ;;
  staging)
    env_file=".env.staging"
    compose_overrides=("docker-compose.staging.yml")
    default_cmd=("up" "-d")
    ;;
  prod|production)
    env_file=".env.production"
    compose_overrides=("docker-compose.prod.yml")
    default_cmd=("up" "-d")
    ;;
  *)
    echo "Unknown environment: $env_alias" >&2
    usage
    exit 1
    ;;
 esac

if [[ ! -f "$env_file" ]]; then
  echo "Environment file '$env_file' not found. Please create it before running." >&2
  exit 1
fi

if [[ ! -r "$env_file" ]]; then
  echo "Environment file '$env_file' is not readable." >&2
  exit 1
fi

if ! command_exists docker; then
  echo "docker is required but not installed or not on PATH." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose plugin is required." >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
. "$env_file"
set +a

export ENV_FILE="$env_file"

compose_files=("-f" "docker-compose.yml")
for file in "${compose_overrides[@]}"; do
  compose_files+=("-f" "$file")
done

declare -a cmd
if [[ $# -gt 0 ]]; then
  cmd=("$@")
else
  cmd=("${default_cmd[@]}")
fi

primary_command="${cmd[0]:-up}"

if [[ "$primary_command" == "up" ]]; then
  if [[ "$skip_quality" == false ]]; then
    run_quality_check
  else
    echo "[orchestrate] Skipping quality checks per flag"
  fi

  ensure_backend_dist

  if [[ "$skip_port_check" == false ]]; then
    check_port_free "${BACKEND_HOST_PORT:-4001}" "backend"
    check_port_free "${FRONTEND_HOST_PORT:-4002}" "frontend"
    check_port_free "${NGINX_HOST_PORT:-4080}" "nginx"
    check_port_free "${POSTGRES_HOST_PORT:-55432}" "postgres"
    check_port_free "${REDIS_HOST_PORT:-56379}" "redis"
  else
    echo "[orchestrate] Skipping port checks per flag"
  fi

  if [[ "$skip_container_check" == false ]]; then
    warn_running_container "ukp-backend"
    warn_running_container "ukp-frontend"
    warn_running_container "ukp-nginx"
    warn_running_container "ukp-postgres"
    warn_running_container "ukp-redis"
  else
    echo "[orchestrate] Skipping running container warnings per flag"
  fi
fi

echo "[orchestrate] docker compose ${cmd[*]} (env=${env_alias})"
docker compose "${compose_files[@]}" "${cmd[@]}"
