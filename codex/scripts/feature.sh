#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

step() {
  local name="$1"; shift
  echo "=== FEATURE: $name ==="
}

run_prompt() {
  local file="$1"
  local out="$2"
  local content=$(cat "$ROOT_DIR/prompts/$file")
  codex exec --sandbox read-only "$content" > "$out"
  echo "$out written"
}

mkdir -p "$ROOT_DIR/out/feature"

ACTION=${1:-all}

if [[ "$ACTION" == "spec" || "$ACTION" == "all" ]]; then
  step spec
  run_prompt feature-spec.md "$ROOT_DIR/out/feature/spec.md"
fi

if [[ "$ACTION" == "scaffold" || "$ACTION" == "all" ]]; then
  step scaffold
  run_prompt feature-scaffold.md "$ROOT_DIR/out/feature/scaffold.md"
fi

if [[ "$ACTION" == "implement" || "$ACTION" == "all" ]]; then
  step implement
  run_prompt feature-implement.md "$ROOT_DIR/out/feature/implement.md"
fi

if [[ "$ACTION" == "validate" || "$ACTION" == "all" ]]; then
  step validate
  run_prompt feature-validate.md "$ROOT_DIR/out/feature/validate.md"
fi

if [[ "$ACTION" == "handoff" || "$ACTION" == "all" ]]; then
  step handoff
  run_prompt feature-handoff.md "$ROOT_DIR/out/feature/handoff.md"
fi

echo "Feature workflow ($ACTION) complete. See codex/out/feature/*.md"

