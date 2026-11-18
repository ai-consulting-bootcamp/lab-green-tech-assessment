# KYC Automation Audit Deck

Green software assessment for a fictional fintech KYC workflow built in n8n.
Path A. Forward looking use case, not a retrofit audit.

## What this is

The client runs KYC checks through n8n. Each check calls three APIs and one LLM step.
This deck defends an assessment of where compute and carbon get wasted, then proposes four fixes mapped to the GSF pillars: carbon, energy, hardware, measurement.

Audience: CTO. This deck supports a technical infrastructure decision, not a marketing or ESG claim.

## Files

- `GreenTech - Automation Audit.pptx`: the deck. 15 slides, 14 content slides plus title.
- `lever-table.md`: the lever table referenced in the deck. Current assumptions vs proposed changes.
- `instructions.md`: the lab instructions.
- `rubric.md`: the grading rubric.
- `README-GreenTech.md`: this file.

## One unit of value (R)

One resolved KYC check, from document upload to approve or reject decision.

## Why the hotspots and assumptions should be believed

Hotspots: n8n execution logs show every retry as a separate workflow run. Each rerun triggers the LLM and ID verification nodes from the start, since the workflow has no state check before those steps. This is visible in the run history, not assumed.

Assumptions: these are stated as assumptions, not measured facts, because the client's actual n8n execution logs and LLM usage dashboard have not been pulled yet. Confirming them is the first step of the measurement plan.

## Solutions covered

Each solution follows a Problem to Change structure and names a Green Software Foundation pattern where one genuinely fits.

1. Problem: same document gets re-embedded on every retry. Change: cache embeddings by document hash, skip re-embedding on retry. Pattern: Cache Static Data.
2. Problem: duplicate ID verification calls happen on workflow retry. Change: add an idempotency check before calling the ID verification API again. Pattern: Keep Request Counts Low.
3. Problem: workflow stays open and idle during the third-party callback wait. Change: switch to an async webhook pattern so the workflow releases the slot while waiting, instead of holding it synchronously. Pattern: Use Asynchronous Network Calls Instead of Synchronous.
4. Problem: no visibility into retries, tokens, or cost per check. Change: add a logging step that records tokens, retries, and duration for every check. Pattern: no catalog pattern genuinely fits this one. This solution applies the SCI measurement principle directly. Per the lab's own rule against forcing a pattern match, that is stated explicitly rather than attaching an unrelated pattern.

## Caveats

No carbon neutral claim. No verified baseline yet.
Next step is validating real retry rate and token count with the client.
