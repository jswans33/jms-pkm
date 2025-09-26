#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

run_prompt() {
  local file="$1"; shift || true
  local out="$1"; shift || true
  local content=$(cat "$ROOT_DIR/prompts/$file")
  codex exec --sandbox workspace-write "$content" > "$out"
  echo "$out written"
}

mkdir -p "$ROOT_DIR/out/feature"

# 1) Spec
run_prompt feature-spec-fast.md "$ROOT_DIR/out/feature/spec.md"

# 2) Scaffold
run_prompt feature-scaffold-fast.md "$ROOT_DIR/out/feature/scaffold.md"

# 3) Implement
run_prompt feature-implement-fast.md "$ROOT_DIR/out/feature/implement.md"

# 4) Validate (propose)
run_prompt feature-validate-fast.md "$ROOT_DIR/out/feature/validate.md"

# 5) Execute validation automatically
APPROVE=1 bash "$ROOT_DIR/scripts/feature-validate-exec.sh" || true

# 6) Handoff
run_prompt feature-handoff-fast.md "$ROOT_DIR/out/feature/handoff.md"

# 7) PR description
bash "$ROOT_DIR/scripts/feature-pr.sh"

echo "Fast feature flow complete. See codex/out/feature/*.md"

