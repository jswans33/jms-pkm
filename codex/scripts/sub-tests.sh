#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$ROOT_DIR/out"
PROMPT_CONTENT=$(cat "$ROOT_DIR/prompts/sub-tests.md")
codex exec --sandbox read-only "$PROMPT_CONTENT" > "$ROOT_DIR/out/tests.json"
echo "$ROOT_DIR/out/tests.json written"

