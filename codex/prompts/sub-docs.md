Review project documentation for completeness and accuracy.
Return only JSON with shape:
{
"sources": [{"path": "string", "purpose": "string"}],
"findings": [{
"area": "onboarding|setup|ci|arch|security|release|docs-quality",
"issue": "string",
"evidence": "string",
"severity": "low|medium|high",
"why": "string"
}],
"drift": [{"doc": "string", "code_ref": "string", "note": "string"}],
"gaps": ["string"],
"recommendations": [{"action": "string", "why": "string", "effort": "S|M|L"}]
}
Rules:

- Read-only; prefer concrete evidence and minimal, actionable recommendations.
