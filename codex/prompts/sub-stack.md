Detect the tech stack and propose validation commands.
Return only JSON with shape:
{
"languages": ["string"],
"frameworks": ["string"],
"pkg_managers": ["string"],
"test_runners": ["string"],
"linters": ["string"],
"builders": ["string"],
"evidence": [{"path": "string", "signal": "string"}],
"commands": {
"lint": ["string"],
"format_check": ["string"],
"typecheck": ["string"],
"test": ["string"],
"build": ["string"],
"dev": ["string"]
},
"variants": {"fast": ["string"], "full": ["string"]},
"safety": ["string"]
}
No installs or edits.
