Summarize git state for change awareness.
Return only JSON with shape:
{
"branch": "string",
"ahead_behind": {"ahead": "number", "behind": "number"},
"staged": ["string"],
"unstaged": ["string"],
"untracked": ["string"],
"recent_commits": [{"hash": "string", "subject": "string"}]
}
Rules:

- Read-only. Do not amend or stage. If git is unavailable, return an explanatory note in place of fields.
