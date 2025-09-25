#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
OUT_DIR="$ROOT_DIR/out/feature"
PR_FILE="$ROOT_DIR/out/feature/PR_BODY.md"

SPEC="$OUT_DIR/spec.md"
IMPL="$OUT_DIR/implement.md"
VALIDATE="$OUT_DIR/validate.md"
HANDOFF="$OUT_DIR/handoff.md"

DIFF=$(git --no-pager diff --staged || true)
if [[ -z "$DIFF" ]]; then
  DIFF=$(git --no-pager diff || true)
fi

PROMPT=$(cat << 'EOF'
Compose a crisp Pull Request description from the provided artifacts and diff.
Output (markdown):
- Title
- Summary (WHAT and WHY)
- Scope (files/areas)
- Implementation notes (key diffs)
- Validation (commands and results expected)
- Risks & mitigations
- Checklist (tests, docs, backwards-compat)
Keep concise and actionable.
EOF
)

codex exec --sandbox read-only "${PROMPT}

SPEC:
$(cat "$SPEC" 2>/dev/null)

IMPLEMENT:
$(cat "$IMPL" 2>/dev/null)

VALIDATE:
$(cat "$VALIDATE" 2>/dev/null)

HANDOFF:
$(cat "$HANDOFF" 2>/dev/null)

GIT DIFF:
${DIFF}
" > "$PR_FILE"

echo "$PR_FILE written"

