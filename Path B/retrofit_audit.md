# Green Retrofit Audit — AI Delivery Risk Assistant (Path B, final)

**Artifact audited:** [github.com/akansha27nov/delivery-risk-assistant](https://github.com/akansha27nov/delivery-risk-assistant) — audited against current `main`.

**50-word artifact description:** The AI Delivery Risk Assistant reads project
artefacts, chunks evidence, creates embeddings, retrieves evidence across multiple
risk angles, reranks candidates, extracts structured delivery risks, validates
citations and contradictions, and produces reports or human-review escalations. It
exposes Streamlit, FastAPI, CLI, and scheduled n8n execution paths.

**Primary audience:** CTO / VP Engineering

**Primary user journey:** Project evidence → audit → validated, evidence-grounded
risk findings → report / human escalation.

**Functional unit (R):** One completed project risk audit that produces validated,
evidence-grounded risk findings. "Completed" means the workflow reaches a usable
output and every risk claim passes citation/context validation.

## SCI-style boundary

**In boundary:** application compute (FastAPI on Render, Streamlit UI), Pinecone
vector storage + query compute, network/data movement between services, OpenAI
embedding + structured-extraction calls, Cohere rerank calls, scheduled n8n
execution and its Notion/Telegram calls.

**Excluded (stated):** developer workstations / local dev runs, unrelated external
traffic to Render or Notion, Telegram's own infrastructure beyond the webhook call,
one-time repo/CI build minutes (not per-audit).

SCI reports carbon as a rate per functional unit: operational impact **E × I**, plus
embodied emissions **M**, divided by **R**.

## Hotspots (code-grounded, current `main`)

1. **5× embedding calls per question** — `retrieval.py`'s `gather_evidence_async()` calls the OpenAI embeddings API once per risk angle (5 angles) instead of one batched call.
2. **Full namespace re-embed on every ingest run** — `embedding.py`'s `build_vector_store()` deletes and re-upserts an entire project's Pinecone namespace on every run, regardless of how much actually changed.
3. **No fingerprint check on live uploads** — `app/sidebar.py`'s upload flow calls `add_document_to_project()` on every "Add to Knowledge Base" click; nothing skips a re-embed if the uploaded file is unchanged.
4. **Two uncached, deterministic LLM calls** — `agent_analysis.py`'s `_call_llm()` and `_call_llm_targeted_contradiction_check()` both run at `temperature=0, seed=42`. Identical evidence always produces identical output, but neither call is cached, and the second can fire once per missed-contradiction candidate group — a real, previously unflagged multiplier.
5. **Weekly full audit regardless of change** — per `README.md` and `stack_decision.md`, an n8n cron trigger runs the complete LangGraph pipeline every Thursday even if no project evidence changed since the prior run.

## Green opportunities — prioritized

### 1. Batch the 5 embedding calls into one
**Problem:** `query_single_angle()` in `retrieval.py` calls the OpenAI embeddings API separately for each of the 5 risk angles, per question — 5 HTTP round trips.
**Change:** Pass all 5 angle-augmented queries as one list to a single `embeddings.create()` call; split the returned vectors by index.
**Pillars:** Energy, Hardware.
**GSF pattern:** Reduce transmitted data.
**Measures:** embedding calls/R, latency/R.

### 2. Fingerprint before re-embedding (ingest + live upload)
**Problem:** `build_vector_store()` wipes and re-embeds a full namespace on every ingest run; the Streamlit upload flow re-embeds on every click, changed or not.
**Change:** Hash each chunk's normalized text. Skip embedding when the fingerprint already exists in Pinecone; route only new/changed chunks through the existing non-destructive `add_document_to_project()`.
**Pillars:** Energy, Carbon, Hardware.
**GSF pattern:** Optimize data storage formats for AI training and inference.
**Measures:** chunks embedded/R, embeddings skipped/R.

### 3. Cache both deterministic LLM calls
**Problem:** `_call_llm()` and `_call_llm_targeted_contradiction_check()` are both deterministic given their input, but neither is cached.
**Change:** Key a cache on a hash of the formatted evidence text for both call sites; skip the OpenAI call on a hit. Doubles as free cost/token logging once instrumented.
**Pillars:** Energy, Measurement.
**GSF pattern:** Optimize agent orchestration to reduce unnecessary model calls.
**Measures:** LLM calls/R, cache hit rate, tokens/R.

### 4. Make the weekly n8n audit change-aware
**Problem:** The n8n cron trigger runs the complete pipeline every Thursday whether or not any project evidence changed since the prior run.
**Change:** Compare a project-level evidence fingerprint before invoking the pipeline; skip or run a lightweight delta check when nothing material changed.
**Pillars:** Energy, Carbon, Measurement.
**GSF pattern:** Optimize agent orchestration to reduce unnecessary model calls.
**Measures:** full audits/week, skipped audits/week, cost/week.

### 5 (future / not built into the 4-solution deck). Right-size retrieval fan-out
**Problem:** `RISK_ANGLES` (5) and `DEFAULT_TOP_K` (5, up to 25 pooled candidates before rerank to `FINAL_TOP_N`=8) in `config.py` are set from a testing anecdote, not a systematic eval.
**Change:** Benchmark 3/4/5 angles and lower candidate counts against `docs/ground_truth_risks.md`; keep the smallest set that preserves recall.
**Pillars:** Energy, Hardware, Measurement.
**Measures:** candidates/R, rerank work/R, ground-truth recall.

## Measurement plan (1–2 week baseline before changing production)

**Operational / AI:** embedding calls/R (target: 1, down from 5) · LLM calls/R ·
chunks & embeddings/R · retries/R · latency/R · cost/R

**Quality:** citation pass rate · evidence/ground-truth recall · contradiction
detection rate · HITL escalation rate

**Sustainability:** estimated energy/R · location/time grid carbon intensity ·
estimated operational carbon/R · embodied carbon (only if boundary + hardware data
support it)

**Success looks like:** embedding calls per question drop from 5 to 1, ingest and
upload re-embeds drop by the share of unchanged content, weekly audits skip when
nothing changed, and citation pass rate + ground-truth recall stay intact
throughout.

## Honest framing

This is an architecture-based retrofit audit, not a measured carbon footprint. The project supports claims about which pipeline stages and schedules exist — it does not yet expose enough telemetry to defend an exact gCO2e/R number.

**Do not claim:** carbon neutral · a specific percentage reduction · exact energy per API call · exact embodied carbon — until telemetry, provider data, and the boundary above are actually measured.

**Validation and safety gates are not up for removal.** Citation, context, and contradiction checks are valuable and stay exactly as they are; every proposed change targets redundant compute, not the safety logic.

## Stakeholder challenge

**Why should we believe the hotspots?** Every hotspot above traces to a named file and function on the current `main` branch — not an inferred architecture diagram.
The *relative* carbon impact of each hotspot remains a hypothesis until measured.

## Before → after hypothesis

**Before:** ingest → embed → retrieve (5×) → rerank → LLM (uncached, 2×) → validate
→ report, on every question and every Thursday.

**After:** fingerprint → skip unchanged work → 1 batched embed call → cached LLM
calls → validate → report, only when evidence changed.

**Hypothesis:** these changes reduce compute and API calls per completed audit (R)
while preserving evidence quality and every safety gate. No percentage claim until
the 1–2 week baseline is actually measured.

## Sources

- Green Software Foundation — SCI: https://greensoftware.foundation/standards/sci/
- Green Software Foundation — SCI for AI: https://greensoftware.foundation/standards/sci-ai/
- Green Software Patterns: https://patterns.greensoftware.foundation/
- Optimize data storage formats for AI training and inference: https://patterns.greensoftware.foundation/development/data-handling/optimize-data-storage-ai-training/
- Reduce transmitted data: https://patterns.greensoftware.foundation/catalog/cloud/reduce-transmitted-data/
- Repository audited: https://github.com/akansha27nov/delivery-risk-assistant
