Summarize test setup.
Return only JSON with shape:
{
"runners": ["string"],
"coverage": {"tool": "string", "commands": ["string"]},
"watch": ["string"],
"test_globs": ["string"],
"commands": {"unit": ["string"], "integration": ["string"], "coverage": ["string"]}
}
