#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$ROOT_DIR/out"
PROMPT_CONTENT=$(cat "$ROOT_DIR/prompts/sub-docs.md")
codex exec --sandbox read-only "$PROMPT_CONTENT" > "$ROOT_DIR/out/docs.json"
echo "$ROOT_DIR/out/docs.json written"

