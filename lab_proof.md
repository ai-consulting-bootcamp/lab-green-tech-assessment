# Lab proof: Defend your stack's carbon story

**Path followed: Path B, green retrofit audit**
**Artifact audited:** my Project 3 "RCSA Evidence & Challenge Agent" (LangGraph + OpenAI), repo: https://github.com/muratcomez1/AI-assisted-RCSA
**Primary audience of the deck:** Chief Risk Officer (CRO), with the CTO as co-reader
**Unit of value (R):** one RCSA challenge report for one process (7 process-risk pairs), handed to the Second Line reviewer

## 1. Deliverables

| File | What it is |
|---|---|
| [rcsa_agent_carbon_story_path_b.pptx](rcsa_agent_carbon_story_path_b.pptx) | Slide deck: title + 14 content slides, with speaker notes |
| [rcsa_agent_carbon_story_path_b.pdf](rcsa_agent_carbon_story_path_b.pdf) | PDF export of the deck |
| [retrofit_audit_template.md](retrofit_audit_template.md) | Completed Path B retrofit audit template |
| [carbon_evidence.py](carbon_evidence.py) | Script that reads the Project 3 run logs, measures real prompt sizes and builds the before/after per R |
| [carbon_evidence_output.txt](carbon_evidence_output.txt) | Output of one run of the script |

## 2. Code / workflow

`carbon_evidence.py` works on a clone of the Project 3 repo:

1. **Part 1** parses the 16 JSON run logs committed in `outputs/reports/` and counts LLM attempts, failures by error type, retries that could never succeed, and failed external API attempts.
2. **Part 2** imports the agent's own `rcsa_agent.llm._payload()` and builds the exact prompt the `llm_challenge` node sends for each of the 7 Payment Processing pairs. No API call is made.
3. **Part 3** turns that into a before/after hypothesis per R for solutions 1–3 (fail fast, batch the pairs, skip low-priority pairs).

## 3. One run with its input

```bash
git clone https://github.com/muratcomez1/AI-assisted-RCSA ../AI-assisted-RCSA
python3 carbon_evidence.py --repo ../AI-assisted-RCSA > carbon_evidence_output.txt
```

Input: the 16 committed run logs and `data/rcsa_synthetic_data.csv` (process "Payment Processing", 7 pairs). Assumptions: tokens ≈ chars ÷ 4, ~250 output tokens per challenge.

## 4. Evidence produced

From [carbon_evidence_output.txt](carbon_evidence_output.txt):

| Evidence (real, from logs and code) | Value |
|---|---|
| LLM attempts across 15 runs | 154 |
| Failed attempts (401 / 403 / 400) | 112 (73%) |
| Retries on errors that could never succeed | 56 |
| Failed external API attempts (GDELT HTTP 429) | 15 |
| Identical external context re-sent per pair | ~633 tokens × 7 pairs |

| Per R (estimate) | Before | After | Change |
|---|---|---|---|
| LLM calls, working key | 7 | 1 | -86% |
| Total tokens | ~11,840 | ~5,630 | -52% |
| LLM calls with a broken key | 14 | 1 | -93% |

## 5. Final output

The deck first defends the design (what is already lean: rules, TF-IDF retrieval, small model, nothing always on). It then shows the real hotspots from the logs, the assumptions with a "why should we believe this?" answer, and the four-pillar map. It proposes 5 changes, each labelled with its GSF pillar(s): fail fast on non-retryable errors, batch the pairs, no LLM for low-priority pairs, cache external research and respect 429, measure tokens per R. It closes with a before/after hypothesis, a 2-week measurement plan tied to R, and caveats.

Checklist:
- [x] One primary audience named on the title slide (CRO)
- [x] Every solution mapped to at least one pillar (footer "Pillar: …" on each solution slide)
- [x] No unverifiable claims: no "carbon neutral", no gCO₂e figure
- [x] Recommendations linked to business outcomes (cost, reliability, latency, ESG reporting risk)
- [x] 14 content slides + title (within 8–14)
- [x] Stretch: numeric proxy from real logs on the defense slides

## 6. Failure / limitation I hit

**My first draft was wrong.** It assumed one LLM call per risk per node (~286 calls per R). When I checked the real LangGraph graph (`rcsa_agent/graph.py`, `nodes.py`), only `llm_challenge` calls the model, once per pair. So I rebuilt the audit on the real code and the real run logs.

**Energy and carbon could not be measured.** The OpenAI API returns no energy (E), region grid intensity (I) or embodied emissions (M), and the run log has no token field yet. Tokens are estimated as chars ÷ 4 and are only a proxy for E. The logs are 16 development runs, so the 73% failure rate is higher than production would be. Solution 5 (log `resp.usage` per call) is the step that replaces these estimates with measurements.
