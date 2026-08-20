# KYC Automation Audit Deck

Green software assessment for a fictional fintech KYC workflow built in n8n.
Path A. Forward looking use case, not a retrofit audit.

## What this is

The client runs KYC checks through n8n. Each check calls three APIs and one LLM step.
This deck defends an assessment of where compute and carbon get wasted, then proposes four fixes mapped to the GSF pillars: carbon, energy, hardware, measurement.

Audience: CTO.

## Files

- `kyc-automation-audit.pptx`: the deck. 15 slides, 14 content slides plus title.
- `lever-table.md`: the lever table referenced in slide 13. Current assumptions vs proposed changes.
- `README.md`: this file.

## One unit of value (R)

One resolved KYC check, from document upload to approve or reject decision.

## Solutions covered

1. Cache document embeddings by hash, skip re-embedding on retry.
2. Add idempotency check before repeat ID verification calls.
3. Switch to async webhook pattern for third-party callback waits.
4. Add logging for tokens, retries, and duration per check.

## Caveats

No carbon neutral claim. No verified baseline yet.
Next step is validating real retry rate and token count with the client.
