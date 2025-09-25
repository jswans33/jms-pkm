#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$ROOT_DIR/out"

# 1) FS first
[[ "${SKIP_FS:-}" == "1" ]] || bash "$ROOT_DIR/scripts/sub-fs.sh" || true

# 2) Parallel discovery: search, stack, tests, docs
PIDS=()
[[ "${SKIP_SEARCH:-}" == "1" ]] || { bash "$ROOT_DIR/scripts/sub-search.sh" & PIDS+=($!); }
[[ "${SKIP_STACK:-}" == "1" ]] || { bash "$ROOT_DIR/scripts/sub-stack.sh" & PIDS+=($!); }
[[ "${SKIP_TESTS:-}" == "1" ]] || { bash "$ROOT_DIR/scripts/sub-tests.sh" & PIDS+=($!); }
[[ "${SKIP_DOCS:-}" == "1" ]] || { bash "$ROOT_DIR/scripts/sub-docs.sh" & PIDS+=($!); }

for pid in "${PIDS[@]:-}"; do
  wait "$pid" || true
done

# 3) Git awareness
[[ "${SKIP_GIT:-}" == "1" ]] || bash "$ROOT_DIR/scripts/sub-git.sh" || true

# 4) Risk
[[ "${SKIP_RISK:-}" == "1" ]] || bash "$ROOT_DIR/scripts/sub-risk.sh" || true

# 5) Compose
if [[ "${COMPOSE:-}" == "1" ]]; then
  bash "$ROOT_DIR/scripts/compose-report.sh"
else
  echo "Artifacts present: $(ls -1 "$ROOT_DIR/out" | tr '\n' ' ')" > "$ROOT_DIR/out/report.md"
  echo "codex/out/report.md (stub) written; set COMPOSE=1 to build full report" >> "$ROOT_DIR/out/report.md"
fi

