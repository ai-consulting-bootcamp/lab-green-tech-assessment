# Retrofit audit: Vendor Due-Diligence Agent (Path B)

**Path:** B, green retrofit audit of an existing bootcamp artifact
**Artifact:** Project 3, Vendor Due-Diligence Agent: https://github.com/PietFALB/vendor-dd-agent
**Primary audience:** Head of Compliance at a mid-size Dutch law firm (the buyer named in `stack_decision.md`)
**Functional unit (R):** one completed vendor due-diligence risk report (one company, run through registry, sanctions and adverse-media checks, ending in a scored report)

## What the system does (50 words)

A LangGraph agent that checks a company before it becomes a vendor. It resolves the legal entity (GLEIF, KvK), fuzzy-matches the company against a local OpenSanctions CSV, runs a ReAct agent over news (Tavily) and AML guidance (Pinecone RAG), and uses gpt-4o-mini to write a rated report with a recommendation.

## Primary user journey

Compliance officer enters a company name (terminal, Streamlit, REST API or n8n form) → waits 1–3 minutes → receives one Markdown report (R).

## Hotspots (compute / data movement), per R, taken from the code

| # | Where | What happens per report | Evidence in repo |
|---|---|---|---|
| 1 | Research agent (ReAct) | Up to 6 tool calls and a 20-step limit; every agent step resends the growing message history to the LLM, so tokens grow with each step | `agent/review.py` (`MAX_SEARCHES = 6`, `MAX_STEPS = 20`) |
| 2 | Other LLM calls | Synthesis (1) + assessment (1) + report prose (1, or 2 if `check_report` fails and triggers a rewrite) | `agent/review.py`, `agent/assess.py`, `agent/report.py`, `nodes.route_after_check` |
| 3 | GLEIF entity resolution | About 15 HTTP calls per report: 1 full-text search + 12 exact legal-name searches (11 legal forms + "Koninklijke … N.V.") + 2 parent lookups, with no cross-run cache | `tools/gleif.py` (`LEGAL_FORMS`, `search_gleif`) |
| 4 | Sanctions screening | Loads the full OpenSanctions CSV with pandas (cached only within one process, so every `main.py` run reloads it) and fuzzy-matches up to ~5 names against every alias | `tools/sanctions.py` (`@lru_cache(maxsize=1)` on `_load`) |
| 5 | Embeddings | Each `guidance_search` embeds a query (OpenAI). `_freeze_guidance` embeds the **same fixed query** on every report with a sanctions hit | `rag/retrieve.py`, `agent/assess.py` (`_freeze_guidance`) |
| 6 | Repeated whole runs | No report cache: the same company is fully re-checked. `reports/archive/` shows 5 Sberbank runs and 5 ING runs during development | `reports/archive/` |
| 7 | Idle capacity | `/check` is synchronous (1–3 min). The FastAPI server and n8n run continuously to serve occasional form submissions | `api.py`, README (n8n timeout 180 s) |

**Repeated work (caching candidates):** hotspots 3, 5 and 6, plus the sanctions CSV load in hotspot 4.

## Honest assumptions (what I do not know yet)

1. **Region / grid:** OpenAI, Tavily and the Pinecone free tier most likely run in US data centres. I have not confirmed the regions. LangSmith is set to the EU endpoint (`.env.example`).
2. **Model size:** gpt-4o-mini is a small model, but OpenAI does not publish energy per token, so energy per R can only be estimated from tokens.
3. **Call pattern:** about 5–12 chat-completion calls per report (unmeasured). The research loop probably dominates token use.
4. **Retention:** reports are kept indefinitely as Markdown (small). LangSmith traces are kept per its plan. The sanctions CSV is a large local snapshot that gets re-downloaded by hand.
5. **Volume:** demo-scale today (tens of reports). A real firm might run tens to hundreds per month, plus re-screening of existing vendors.

## Green opportunities (prioritized)

1. **Quick win: cache stable lookups.** GLEIF results per name/LEI (TTL of about 7 days), the fixed `_freeze_guidance` embedding and passage, and query embeddings. Pillars: energy, measurement. Pattern: *Cache static data*.
2. **Quick win: trim the GLEIF query fan-out.** Run the 12 exact-name searches only when the full-text match scores below 95 (the `STRONG` constant already exists), and stop at the first exact hit. Pillar: energy (less data movement).
3. **Medium: cut LLM tokens per R.** Lower `MAX_SEARCHES` and `MAX_STEPS` for the *standard* route only (clean sanctions result), pass the research agent short article snippets, and make `check_report` failures less likely so the rewrite call is rarer. Keep gpt-4o-mini and resist the "stronger model" TODO unless a sample eval shows a quality gain. Pillars: energy, hardware. Pattern: *Optimize the size of AI/ML models* / *Right-size*.
4. **Medium: report reuse and batch re-screening.** Return a cached report if the same company was checked in the last N days and the sanctions CSV date is unchanged. Run periodic re-screening as a nightly batch (n8n schedule, GTM sprint 3), which can be time-shifted to low-carbon hours. Pillars: carbon (time-shifting), energy.
5. **Strategic: region and idle capacity.** Run the API on demand (serverless or scale-to-zero) in an EU region with a low-carbon grid, and choose EU regions for Pinecone. Pillars: carbon (location), hardware (no idle server). Pattern: *Scale down unused resources* / *Choose region closest to users / with lower carbon intensity*.
6. **Enabler: measure per R.** Log tokens, LLM calls, HTTP calls and wall-clock time per report (LangSmith already traces runs). Pillar: measurement. Ties to SCI = (E × I + M) per R.

## What I would measure to prove improvement (1–2 weeks)

- Tokens per R (input + output), split by node (from LangSmith)
- LLM calls per R, rewrites per R (`check_attempts`)
- External HTTP calls per R (GLEIF, Tavily, embeddings) and cache hit rate
- Wall-clock time per R, and API cost per R (cost as a proxy for energy)
- Quality guardrail: same rating and recommendation on the 7-company regression set plus the 3 sample reports (Sberbank, ING, Xyzzy)

**Success:** at least 30% fewer tokens per R and at least 50% fewer external calls per R, with **zero** rating or recommendation changes on the regression set.

## Risks / tradeoffs

- **Stale cache risks a missed sanction.** Sanctions screening is never cached. Report reuse is only allowed when the sanctions data date is unchanged, and the report shows the cache date.
- **Fewer searches could miss adverse media.** Budgets are only cut on the standard route, and the effect is checked against the regression set.
- **Region choice is limited** by provider availability (OpenAI) and GDPR/data-residency needs, which actually favour the EU.
- **Estimates, not measurements:** every carbon figure is a hypothesis until per-R logging runs. No "carbon neutral" claims.
