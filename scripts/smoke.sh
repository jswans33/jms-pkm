#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_root"

usage() {
  cat <<'USAGE'
Usage: scripts/smoke.sh [environment]

Environments:
  dev (default) | test | staging | prod

The script will:
  1. Ensure the stack is running via orchestrate.sh (up -d, skipping duplicate checks if already healthy)
  2. Poll the nginx proxy (health/config) until it responds with HTTP 200 and {"status":"ok"}
  3. Exit non-zero if the health endpoint fails within the timeout window
USAGE
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

if ! command_exists curl; then
  echo "curl is required to run the smoke test." >&2
  exit 1
fi

env_alias=${1:-dev}
if [[ "$env_alias" =~ ^(-h|--help)$ ]]; then
  usage
  exit 0
fi

case "$env_alias" in
  dev)
    env_file=".env.dev-container"
    default_port=3080
    ;;
  test)
    env_file=".env.testing"
    default_port=4180
    ;;
  staging)
    env_file=".env.staging"
    default_port=4380
    ;;
  prod|production)
    env_file=".env.production"
    default_port=80
    ;;
  *)
    echo "Unknown environment: $env_alias" >&2
    usage
    exit 1
    ;;
 esac

if [[ ! -f "$env_file" ]]; then
  echo "Environment file '$env_file' not found. Cannot continue." >&2
  exit 1
fi

# Bring up stack (idempotent). Skip repeated quality/port/container checks for faster smokes.
"$project_root/scripts/orchestrate.sh" --skip-quality --skip-port-check --skip-container-check "$env_alias" up -d

ensure_services_running() {
  local -a expected_services=(backend frontend nginx postgres redis)
  local -a running_services

  if ! mapfile -t running_services < <(docker compose ps --services --filter status=running); then
    echo "[smoke] Failed to read docker compose service status." >&2
    return 1
  fi

  local missing=()
  for service in "${expected_services[@]}"; do
    if ! printf '%s\n' "${running_services[@]}" | grep -qx "$service"; then
      missing+=("$service")
    fi
  done

  if ((${#missing[@]} > 0)); then
    echo "[smoke] Service(s) not running: ${missing[*]}" >&2
    docker compose ps >&2
    if docker compose ps --services --filter status=exited >/dev/null 2>&1; then
      echo "[smoke] Exited services:" >&2
      docker compose ps --services --filter status=exited >&2 || true
    fi
    return 1
  fi

  return 0
}

if ! ensure_services_running; then
  echo "[smoke] Aborting before health polling due to unhealthy services." >&2
  exit 1
fi

set -a
# shellcheck source=/dev/null
. "$env_file"
set +a

nginx_port="${NGINX_HOST_PORT:-$default_port}"
health_url="http://localhost:${nginx_port}/api/health/config"
backend_port="${BACKEND_HOST_PORT:-4001}"
backend_health_url="http://localhost:${backend_port}/api/health/config"

backend_max_attempts=30

for (( attempt=1; attempt<=backend_max_attempts; attempt++ )); do
  if backend_response=$(curl -fsSL "$backend_health_url" 2>/dev/null); then
    if [[ "$backend_response" == '{"status":"ok"}' ]]; then
      break
    fi
    echo "[smoke] Backend unexpected response: $backend_response" >&2
  else
    echo "[smoke] Backend attempt ${attempt}/${backend_max_attempts} failed; retrying..." >&2
  fi
  sleep 2
done

if [[ ${attempt:-0} -gt backend_max_attempts ]]; then
  echo "[smoke] Backend did not respond with {\"status\":\"ok\"} after ${backend_max_attempts} attempts at ${backend_health_url}." >&2
  exit 1
fi

echo "[smoke] Polling ${health_url} ..."

max_attempts=30
sleep_between=2

for (( attempt=1; attempt<=max_attempts; attempt++ )); do
  if response=$(curl -fsSL "$health_url" 2>/dev/null); then
    if [[ "$response" == '{"status":"ok"}' ]]; then
      echo "[smoke] Health check passed after ${attempt} attempt(s)."
      exit 0
    else
      echo "[smoke] Unexpected response: $response" >&2
    fi
  else
    echo "[smoke] Attempt ${attempt}/${max_attempts} failed; retrying in ${sleep_between}s..."
  fi
  sleep "$sleep_between"
done

echo "[smoke] Health check failed after ${max_attempts} attempts." >&2
exit 1
