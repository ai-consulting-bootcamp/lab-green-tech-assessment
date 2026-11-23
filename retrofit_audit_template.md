# Retrofit audit template (Path B)

**Artifact:** Project 3 "RCSA Evidence & Challenge Agent" (LangGraph + OpenAI, Python). Repo: https://github.com/muratcomez1/AI-assisted-RCSA

**What it does (50 words):** The agent takes a completed First Line RCSA (one row per process-risk pair) and compares the answers with loss events, KRIs, the previous RCSA and controls. Deterministic rules raise challenge flags, local TF-IDF retrieval adds guidance, and an LLM drafts challenge questions. It writes a report for the Second Line reviewer, pending human review.

**Primary user journey:** Reviewer runs `python run_rcsa.py --process "Payment Processing"` → validate_input → apply_rules → retrieve_evidence → external_research (Wikipedia, Tavily) → llm_challenge (1 OpenAI call per pair) → build_report → finalize (Markdown report + JSON run log) → human review.

**Hotspots (compute / data movement):**
- `llm_challenge`: the only model node; 7 calls per R; every exception retried once, incl. 401/403/400. In the 16 committed logs, 112 of 154 attempts failed (73%), 56 of them retries that could never succeed
- Same 270-token system prompt + ~633 tokens of identical external context re-sent with each of the 7 pairs
- `external_research`: queried on every run; GDELT answered HTTP 429 in 5 runs (15 failed attempts with 12 s waits)
- Already lean: rules, TF-IDF retrieval, report and file I/O use no model; no vector DB; no always-on server

**Green opportunities (prioritized):**
1. Quick win: fail fast on 401/403/400 and switch the run to the labelled deterministic fallback (Energy, Measurement)
2. Quick win: batch all pairs of a process into one structured-output call, shared context once (Energy, Hardware)
3. Quick win: no LLM for low-priority pairs; keep the deterministic draft (Energy)
4. Medium: cache external research per process + date; back off on 429 instead of retrying (Energy, Hardware)
5. Strategic: log `resp.usage` tokens and latency per call in the run log; pin the model, switch only after a 7-pair eval (Measurement, Carbon)

**What I would measure to prove improvement:** LLM calls per R, input/output tokens per R (`resp.usage`), failed and retried attempts by error type (already logged), latency per R, cost per R as a proxy, reviewer judgement of challenge quality on 7 sample pairs. R = one RCSA challenge report for one process.

**Risks / tradeoffs:**
- Batching: one failed call affects all pairs → keep the per-pair deterministic fallback and per-pair source-id validation
- Batched challenges may be less specific → compare on 7 sample pairs before switching
- Skipping low-priority pairs gives the reviewer less narrative text → the deterministic questions and flags stay visible and labelled
- Cached external context can be a day old → acceptable, external context is "context only" by design
- Carbon-aware choices depend on provider region and grid intensity data I do not have
