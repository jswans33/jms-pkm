Inventory the repository filesystem for grounding.
Return only JSON with shape:
{
"root_dirs": [{"path": "string", "entries": "number"}],
"top_files": [{"path": "string", "size": "number"}],
"configs": [{"path": "string", "reason": "string"}],
"notes": ["string"]
}
Rules:

- Read-only. No edits or network.
- Prefer summarizing directories and key config files.
