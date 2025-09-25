# Codex Context Workflow

Purpose

- A safe, read-only orchestration to build repo context: filesystem, search signals, stack, tests, docs, git state, risks; then compose a WHY-driven report.

Contents

- prompts/: all sub-agent and high-level prompts (vendored, workspace-relative)
- scripts/: orchestrator and sub-agent wrappers (read-only by default)
- out/: artifacts emitted by sub-agents (JSON/MD)
- workflows/: YAML workflow cards describing steps and scripts

Run

- One-shot (gather + compose):
  - bash codex/scripts/orchestrate.sh COMPOSE=1
- Gather only:
  - bash codex/scripts/orchestrate.sh
- Compose report only:
  - bash codex/scripts/compose-report.sh

Make targets

- make codex-context # gather + compose
- make codex-context-gather # gather only
- make codex-context-compose # compose only

Workflows

- See codex/workflows/context.yml and codex/workflows/feature.yml for runnable cards.
