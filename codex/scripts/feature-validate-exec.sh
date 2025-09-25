#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
OUT_DIR="$ROOT_DIR/out/feature"
VALIDATE_MD="$OUT_DIR/validate.md"

if [[ "${APPROVE:-}" != "1" ]]; then
  echo "Refusing to run without APPROVE=1. Review $VALIDATE_MD and re-run with APPROVE=1." >&2
  exit 1
fi

if [[ ! -f "$VALIDATE_MD" ]]; then
  echo "Missing $VALIDATE_MD. Run: bash $ROOT_DIR/scripts/feature.sh validate" >&2
  exit 1
fi

echo "Parsing commands from $VALIDATE_MD ..."

run_list() {
  local title="$1"; shift
  local cmds=("$@")
  if [[ ${#cmds[@]} -gt 0 ]]; then
    echo "-- $title --"
    for c in "${cmds[@]}"; do
      echo ">$ $c"
      bash -lc "$c"
    done
  fi
}

TEST_CMDS=( $(grep -A20 -i '^- Test commands' "$VALIDATE_MD" | sed '1d' | sed '/^-/q' | sed '/^\s*[-*]\s*/!d;s/^\s*[-*]\s*//' ) ) || true
LINT_CMDS=( $(grep -A20 -i '^- Lint/format/typecheck' "$VALIDATE_MD" | sed '1d' | sed '/^-/q' | sed '/^\s*[-*]\s*/!d;s/^\s*[-*]\s*//' ) ) || true
BUILD_CMDS=( $(grep -A20 -i '^- Build commands' "$VALIDATE_MD" | sed '1d' | sed '/^-/q' | sed '/^\s*[-*]\s*/!d;s/^\s*[-*]\s*//' ) ) || true

run_list "Tests" "${TEST_CMDS[@]:-}"
run_list "Lint/Format/Typecheck" "${LINT_CMDS[@]:-}"
run_list "Build" "${BUILD_CMDS[@]:-}"

echo "Validation commands completed."

