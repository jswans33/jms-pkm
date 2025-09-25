Identify risky areas based on current repo and recent changes.
Return only JSON with shape:
{
"risks": [{"area": "string", "reason": "string", "severity": "low|medium|high"}],
"approvals_needed": ["string"],
"security_notes": ["string"],
"suggested_mitigations": ["string"]
}
