codex-context:
	bash codex/scripts/orchestrate.sh COMPOSE=1

codex-context-gather:
	bash codex/scripts/orchestrate.sh

codex-context-compose:
	bash codex/scripts/compose-report.sh

# Feature workflow targets
feature-all:
	bash codex/scripts/feature.sh all

feature-spec:
	bash codex/scripts/feature.sh spec

feature-scaffold:
	bash codex/scripts/feature.sh scaffold

feature-implement:
	bash codex/scripts/feature.sh implement

feature-validate:
	bash codex/scripts/feature.sh validate

feature-handoff:
	bash codex/scripts/feature.sh handoff

# Executive summary from context report
codex-exec-summary:
	bash codex/scripts/executive-summary.sh

# Feature extras
feature-validate-exec:
	APPROVE=1 bash codex/scripts/feature-validate-exec.sh

feature-pr:
	bash codex/scripts/feature-pr.sh

# Fast feature (workspace-write, no pauses)
feature-fast:
	bash codex/scripts/feature-fast.sh
