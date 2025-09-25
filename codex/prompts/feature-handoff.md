Provide a concise handoff for the feature:

- Summary: What was done and why
- Pending items: Decisions, blockers, next steps
- Files changed: paths and brief note per file
- Commands to resume: tests/build/lint/dev server
- Git status: If safe, run `git status --porcelain=v1` and summarize staged vs unstaged; otherwise instruct the user to run it.
  Return this as a checklist with actionable bullets.
