# Lab proof: Defend your stack's carbon story

**Ayhan Demir** · Ironhack AI Consulting & Integration Bootcamp · 18 Nov 2026
**Path B (retrofit audit)** of my Project 3, *Fix My Process* · **Primary audience: CPO (AI enablement)**

## Deliverables

| Item | Where |
|---|---|
| Slide deck, online (title + 14 content slides, speaker notes) | [AyhanDemir_FixMyProcess_CarbonStory](https://claude.ai/artifact/P9xdJtg1NiCTgtJd2PoNXY) |
| Slide deck, PowerPoint (same content and notes) | `AyhanDemir_FixMyProcess_CarbonStory.pptx` |
| Audited artifact (repo) | [github.com/ayhandemir7-LSSBB/project3-research-and-report](https://github.com/ayhandemir7-LSSBB/project3-research-and-report): `README.md`, `n8n_workflows/Fix My Process_ main.json`, `cost_analysis.md` |
| Live demo of the audited system | [fix-my-process.onrender.com](https://fix-my-process.onrender.com) (free plan, about 1 minute to wake) |

## 1. Kick-off: the artifact in 50 words

> Fix My Process is an n8n agent for Kleinanzeigen employees. A worker describes a process problem once in a Gradio app; the agent searches the web, news, research papers and four internal PDFs, checks compliance (green/amber/red), and returns a fix report plus a use-case card for the AI enablement team.

**Why green software matters here:** cost ($0.021 per run grows with every employee who adopts the tool), risk (a Berlin request is processed in US regions and every case is kept with no end date), reputation (the tool is pitched as the controlled, measured alternative to personal LLMs, so its own footprint has to be measurable too).

## 2. One unit of value (R)

**R = one completed submission: an employee's problem answered with Report A, and the case logged as Report B for AI enablement.**

- **Why this R:** it is what one run delivers to both readers. "One LLM call" would hide the other 21 calls; "one chat session" varies with follow-ups.
- **Why both reports:** one run researches once and writes both, so splitting them would hide the shared research cost.
- **Boundary:** in = every per-run call (OpenAI, Cohere, Pinecone, Tavily, GNews, OpenAlex, Airtable, Notion, Slack), the n8n host and the app. Out = one-off PDF ingestion, vendor model training, employee devices.

| Baseline per R (measured, v5 run, 10 Nov) | Value |
|---|---|
| Input / output tokens | 29,939 / 2,277 |
| API calls | about 22 (5 LLM, 4 embeddings, 4 Pinecone, 3 Cohere, 3 web/news/research, 3 logging) |
| Wait time | about 45 s |
| Cost | $0.021 expected, at list prices (`cost_analysis.md`) |
| LLM energy and emissions (estimate) | ≈0.15–0.18 Wh and ≈0.06–0.07 gCO2e for the 5 LLM calls (EcoLogits, see section 8) |

## 3. Lever table (the 10-minute win)

| Lever | Current assumption (honest guess) | Better alternative to explore |
|---|---|---|
| Model / size | gpt-4o-mini in all 3 roles: 5 calls and 29,939 input tokens per R (measured). The context it reads is the hotspot, not the model size (guess). | Keep mini for the agent and the writer. Test a smaller tier for the judge on the 15-case set: no blind downgrade. |
| Call pattern (batch, cache, sync) | Synchronous, all 7 tools on every case, about 22 calls per R; auto-fix on every run; the judge re-reads 10k tokens; no cache (measured). | Fix the parse, trim the judge's input, send the agent fewer and shorter results, cache research and retrieval. |
| Infra / region / retention | Pinecone in us-east-1 (free plan), Render in the US (assumed), n8n host and vendor regions unknown; every case kept with no end date. | EU regions where plans allow, n8n on demand, retention rules. Carbon barely moves; residency and latency do. |

## 4. Assessment defense: hotspots

Flow of one R: Employee app (Render, US) → **Research agent (59% of input tokens)** → Report writer (7%) → **Judge + score (34%)** → Logs and alerts (Airtable, Notion, Slack).

| Hotspot | Why it costs | Repeated? |
|---|---|---|
| Agent final call reads all tool results | 14,072 input tokens: 47% of the run | Every run |
| Judge re-reads raw tool results | 10,127 tokens (34%) the agent already read | Every run: trim |
| Auto-fix call after a failed parse | 1,605 in / 634 out to return the same content | Every run: repeat |
| All 7 tools on every case | About 14 search calls; search + rerank = 72% of cost | Every run |
| PDFs and repeat topics searched again | PDFs change only on upload; topics recur | Yes: cache candidate |
| Chat follow-up = full run | Each message reruns all tools + 10 earlier messages | Yes: cache candidate |
| Data far from users, idle host | App + vector index in US; n8n on when nobody submits | Constant |

## 5. Assessment defense: assumptions

| Assumption | My guess | How sure? | How I'll check |
|---|---|---|---|
| Tokens per R | 29,939 in / 2,277 out | High (one run) | Token usage per node, 2 weeks of runs |
| Share of repeat topics | About 30% of cases | Low | Group 2 weeks of submissions by topic |
| Tool share of agent input | About 85% of 14,072 tokens | Medium | Agent input before vs after the tool step |
| Vendor and host regions | US or unknown | Low | Vendor docs, account settings, Ironhack |
| Energy per R (LLM calls) | ≈0.15–0.18 Wh (EcoLogits) | Low | Re-run EcoLogits on 2 weeks of token logs |

**"Why should we believe this?"** Token and call counts come from the n8n execution data of 10 Nov, not from estimates. The two shares are guesses, so week 1 of the measurement plan replaces them with counts.

## 6. Pillars map

| Hotspot | Energy | Carbon | Hardware | Measurement |
|---|---|---|---|---|
| Agent reads all tool results | Yes: fewer tokens | | | Tokens per R |
| Judge re-reads raw results | Yes: fewer tokens | | | Judge tokens per R |
| Auto-fix after failed parse | Yes: 1 call less | | | LLM calls per R |
| All 7 tools on every case | Yes: fewer calls | | | Tool calls per R |
| Repeat searches | Yes: cache it | | | Cache hit rate |
| Chat follow-up = full run | Yes: no full rerun | | | Calls per message |
| Data in US regions | | Yes: grid (I) | | Region per service |
| Idle host, no retention end | | | Yes: idle + storage | Idle hours, GB kept |

Carbon = carbon awareness (cleaner place or time) · Energy = energy efficiency · Hardware = hardware efficiency · Measurement = SCI-style tracking per R.

## 7. Proposed solutions (problem → change → pillar)

| # | Tier | Solution | Problem → change | Business outcome | Pillar | Green Software Pattern |
|---|---|---|---|---|---|---|
| 1 | Quick win | Stop paying twice for the same answer | Auto-fix fires every run and the judge re-reads 10,127 tokens → align the agent's output with its parser (auto-fix as fallback only); the judge gets the reports plus the snippets they cite | One LLM call less, about 29% fewer input tokens per R on its own; lower bill, faster reply | Energy | [Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls) · [Reduce transmitted data](https://patterns.greensoftware.foundation/development/data-handling/reduce-transmitted-data) |
| 2 | Quick win | Send the agent only what it needs | The final call reads 14,072 tokens, mostly tool results (up to 8 chunks from each of 4 searches) → 3 chunks per internal search, 3 web/news/research results instead of 5, shorter snippets | About 6,000 fewer tokens in the biggest call (guess), 20% of input per R | Energy | [Reduce transmitted data](https://patterns.greensoftware.foundation/development/data-handling/reduce-transmitted-data) |
| 3 | Medium | Cache what doesn't change | Static PDFs and repeat topics are searched again → cache web/news/research by topic for 7 days, internal search until a new PDF is uploaded; chat follow-ups reuse the first run's research | Fewer Tavily (38% of cost) and Cohere (29%) calls, faster repeat answers, more room under the Cohere trial's ~330 runs a month | Energy | [Cache static data](https://patterns.greensoftware.foundation/development/data-handling/cache-static-data) |
| 4 | Strategic | Right place, right size, right retention | US regions, an always-on host, no retention end → EU regions where plans allow (Pinecone Standard, Render Frankfurt, an EU n8n host), n8n on demand, retention for run data and case records | GDPR data residency, lower latency in Berlin, less storage. Carbon barely moves: Germany 329 vs Virginia 354 gCO2e/kWh. Owner: CTO | Carbon · Hardware | [Choose the region that is closest to users](https://patterns.greensoftware.foundation/architecture/system-topology/choose-region-closest-to-users) · [Use on-demand execution for AI and agent workloads](https://patterns.greensoftware.foundation/architecture/system-topology/on-demand-execution-ai-agent-workloads) |

Quality gate for every change: the 15-case calibration set (79% on the v4 study) must not drop, with no new wrong "High".

## 8. Measurement plan (2 weeks)

| Metric (per R where possible) | Baseline (v5, 10 Nov) | Target (week 2) | Source |
|---|---|---|---|
| Input tokens per R | 29,939 | −30% or more | n8n token usage per node |
| LLM / research calls per R | 5 / 3 | 4 / about 2 | n8n execution data |
| Cache hit rate | 0% (no cache) | 30% (to confirm) | New Airtable field |
| Cost per R | $0.021 | About $0.014 | Vendor usage pages |
| Wait time p50 / p95 | ≈45 s / not measured | No slower | Airtable `duration_seconds` |
| LLM energy per R (estimate) | ≈0.15–0.18 Wh | ≈0.11–0.13 Wh | EcoLogits, output tokens |
| Quality guardrail | 79% (v4 study) | No drop, no new wrong High | 15-case rubric |

- **Week 1:** add per-run fields (tokens, calls, cache hits, cost) to Airtable, re-score v5 on the 15-case set, count repeat topics, log the agent's input before and after the tools.
- **Week 2:** ship fixes 1 to 3, compare with week 1, and test a smaller model for the judge on the same 15 cases.
- **SCI view:** SCI = ((E × I) + M) per R. E today: ≈0.15–0.18 Wh per R for the LLM calls (EcoLogits). Fixes 1 to 3 lower E (fewer tokens and calls). Fix 4 barely changes I; on-demand hosting and retention cut idle energy and stored hardware (E and M). Reported per R, never as a total.

### EcoLogits estimate (v5 run, run offline on 18 Nov)

EcoLogits 0.11.3 `llm_impacts` with OpenAI gpt-4o-mini, its default US data centre (PUE 1.2) and the output tokens of each call. No API call is needed.

| Call | Output tokens | Energy | Emissions |
|---|---|---|---|
| Agent: tool calls | 177 | ≈0.01 Wh | <0.01 gCO2e |
| Agent: final answer | 637 | 0.04–0.05 Wh | ≈0.02 gCO2e |
| Agent: auto-fix | 634 | 0.04–0.05 Wh | ≈0.02 gCO2e |
| Write Reports A + B | 690 | 0.04–0.05 Wh | ≈0.02 gCO2e |
| Groundedness judge | 139 | ≈0.01 Wh | <0.01 gCO2e |
| **Per R** | **2,277** | **≈0.15–0.18 Wh** | **≈0.06–0.07 gCO2e** |

- **Output tokens only:** input tokens and latency don't change the result (tested at 8, 20 and 45 s). Our hotspots are input tokens (29,939 in vs 2,277 out), so EcoLogits sees the auto-fix removal but not the judge trim or solution 2. Tokens per R stays the main measure; EcoLogits is the secondary estimate.
- **Model size unknown:** EcoLogits assumes 8 to 28B parameters for gpt-4o-mini and warns about lower precision, hence the range.
- **Scope:** LLM calls only. Embeddings, Cohere, Pinecone, the search tools, the n8n host and Render are not included.
- **Grid check:** the German mix gives ≈0.05–0.06 gCO2e per R against ≈0.06–0.07 for the US, which supports the honest region point in solution 4.

## 9. Before/after hypothesis

| Per R | Measured (v5) | Hypothesis | Change |
|---|---|---|---|
| LLM calls | 5 | 4 | −1 call |
| Input tokens | 29,939 | ≈15,200 | ≈−49% |
| Output tokens | 2,277 | ≈1,640 | ≈−28% |
| Web, news, research calls | 3 | ≈2.1 | ≈−30% |
| Cost per R | $0.021 | ≈$0.014 | ≈−31% |
| LLM energy (EcoLogits) | ≈0.15–0.18 Wh | ≈0.11–0.13 Wh | ≈−27% |

**How I got there:** auto-fix removed (−1,605 in, −634 out); the judge reads about 3,000 tokens instead of 10,127; the agent gets about 6,000 fewer tokens of tool results; 30% cache hits on research and retrieval; LLM priced as in `cost_analysis.md`. Only the auto-fix part (5% of input) is measured; the rest rests on guesses. Cost falls less than tokens because Tavily and Cohere are charged per call. The energy row moves only with the auto-fix removal, because EcoLogits counts output tokens.

## 10. Caveats

- **No "carbon neutral" or "green AI" claims.** There is no measured carbon figure per R, only proxies and an estimate.
- **Offsets don't count.** Buying carbon credits doesn't lower the SCI. We cut calls and tokens first.
- **EcoLogits is a partial estimate.** ≈0.06–0.07 gCO2e per R, but it counts output tokens only and guesses the model size, so it misses our input-token savings and every non-LLM call.
- **One run is not a baseline.** Tokens come from one v5 run; red cases and chat follow-ups were not measured.
- **Validate next with the team:** vendor and host regions, the real repeat rate, whether cached results stay correct, and the cost of an EU move.

## 11. Retrofit audit (Path B template)

| Field | Answer |
|---|---|
| Artifact | [project3-research-and-report](https://github.com/ayhandemir7-LSSBB/project3-research-and-report): README, n8n main export, `cost_analysis.md`. Live: fix-my-process.onrender.com |
| Primary user journey | Employee describes a problem once, waits about 45 s, gets a fix report with steps and an access request, then says whether they will use the tool. Report B lands in Airtable and Notion; red cases go to the AI Governance Board. |
| Hotspots (compute / data movement) | Agent final call 47% and judge 34% of input tokens; auto-fix on every run; all 7 tools on every case; repeat searches; US regions; always-on host; no retention end. |
| Green opportunities (prioritised) | 1. Stop repeat calls (auto-fix, judge input) · 2. Send the agent fewer, shorter results · 3. Cache research and retrieval · then EU regions, on-demand host, retention. |
| What I would measure to prove improvement | Tokens, LLM and tool calls per R, cache hit rate, p50/p95 wait, cost per R, an EcoLogits energy estimate, and the 15-case score as a guardrail. |
| Risks / trade-offs | Stale cached results; a judge with less context misses an unsupported claim; fewer chunks can miss a policy rule; an EU move costs a paid plan for little carbon gain. |

## 12. Verify checklist

- [x] One primary audience named on slides 1 and 3: **CPO (AI enablement)**.
- [x] Every proposed solution maps to at least one pillar (pill label on slides 8 to 11).
- [x] No unverifiable claims: no "carbon neutral"; proxies and estimates are labelled (slides 4, 6, 13, 14).
- [x] Recommendations linked to business outcomes: cost, latency, GDPR risk (Business outcome card on slides 8 to 11).
- [x] Deck is 14 content slides plus title (within 8 to 14).
- [x] Patterns cited only where they fit; quick win / medium / strategic called out in each solution's eyebrow.

## 13. Deck map

| Slide | Title | Lab intent |
|---|---|---|
| 1 | Fix My Process: defending the carbon story | Title |
| 2 | Three levers, honest guesses, better options | Lever table (10-minute win) |
| 3 | Every process fix costs about 22 API calls. Is that the right price? | 1 · Hook |
| 4 | R = one completed submission, with both reports | 2 · One unit of value |
| 5 | Where the compute goes for one R | 3 · Assessment defense: hotspots |
| 6 | My honest guesses, and what I don't know yet | 4 · Assessment defense: assumptions |
| 7 | How each hotspot touches the four pillars | 5 · Pillars map |
| 8 | Stop paying twice for the same answer | Solution 1 of 4 · Quick win |
| 9 | Send the agent only what it needs | Solution 2 of 4 · Quick win |
| 10 | Cache what doesn't change | Solution 3 of 4 · Medium |
| 11 | Right place, right size, right retention | Solution 4 of 4 · Strategic |
| 12 | What I track for 2 weeks, and what counts as success | 10 · Measurement plan |
| 13 | What I will not claim, and what I validate next | 11 · Caveats |
| 14 | If we cut repeat work and context, we expect about half the input tokens per R | 12 · Before/after hypothesis |
| 15 | Retrofit audit: Fix My Process | Appendix · Path B retrofit audit |

## Sources

- Project 3 repo: `README.md`, `cost_analysis.md`, n8n main export; v5 execution data of 10 Nov 2026 (tokens, calls, cost shares).
- Green Software Foundation, [Green Software Patterns catalog](https://patterns.greensoftware.foundation/) (patterns linked in section 7).
- Green Software Foundation, [SCI specification overview](https://greensoftware.foundation/articles/built-to-measure-sci-impact-framework-and-carmen/): SCI = ((E × I) + M) per R, ISO/IEC 21031:2024.
- Pinecone, [object limits](https://docs.pinecone.io/reference/api/database-limits/object-limits): Starter plan indexes only in AWS us-east-1.
- Electricity Maps, [Germany grid year review](https://www.electricitymaps.com/year-review): 2025 mean 328.9 gCO2e/kWh (Jan to Nov, consumption-based).
- Low-Carbon Power, [carbon intensity ranking](https://lowcarbonpower.org/ranking?metric=ci): Virginia 353.6 gCO2e/kWh.
- [EcoLogits](https://github.com/mlco2/ecologits): energy and emissions estimates for generative AI API calls.
