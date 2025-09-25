#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
IN_FILE="$ROOT_DIR/out/report.md"
OUT_FILE="$ROOT_DIR/out/executive-summary.md"

if [[ ! -f "$IN_FILE" ]]; then
  echo "Report not found at $IN_FILE. Run: bash $ROOT_DIR/scripts/orchestrate.sh COMPOSE=1" >&2
  exit 1
fi

PROMPT_CONTENT=$(cat "$ROOT_DIR/prompts/executive-summary.md")
REPORT=$(cat "$IN_FILE")

codex exec --sandbox read-only "${PROMPT_CONTENT}

Report:
${REPORT}
" > "$OUT_FILE"

echo "$OUT_FILE written"

