#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$ROOT_DIR/out"

read_safe() {
  local p="$1"
  [[ -f "$p" ]] && cat "$p" || true
}

FS_JSON=$(read_safe "$ROOT_DIR/out/fs.json")
GIT_JSON=$(read_safe "$ROOT_DIR/out/git.json")
SEARCH_JSON=$(read_safe "$ROOT_DIR/out/search.json")
STACK_JSON=$(read_safe "$ROOT_DIR/out/stack.json")
TESTS_JSON=$(read_safe "$ROOT_DIR/out/tests.json")
DOCS_JSON=$(read_safe "$ROOT_DIR/out/docs.json")

PROMPT_CONTENT=$(cat "$ROOT_DIR/prompts/report-builder.md")

codex exec --sandbox read-only "${PROMPT_CONTENT}

Artifacts:
FS_JSON:
${FS_JSON}

GIT_JSON:
${GIT_JSON}

SEARCH_JSON:
${SEARCH_JSON}

STACK_JSON:
${STACK_JSON}

TESTS_JSON:
${TESTS_JSON}

DOCS_JSON:
${DOCS_JSON}
" > "$ROOT_DIR/out/report.md"

echo "$ROOT_DIR/out/report.md written"

