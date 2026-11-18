# Green Retrofit Audit Notes - AI Search Visibility Agent (Path B)

**Author:** Barsha Mishra
**Path:** **B - Green retrofit audit** of an existing bootcamp artifact
**Artifact:** my Project 3, the AI Search Visibility Agent (n8n workflow + LangGraph fact-checker on Render). Repo: https://github.com/barsha-mishra/ai-search-visibility-agent
**Primary audience:** CTO of an SEO agency that would run the agent weekly for its clients
**Deck:** `green-retrofit-audit-ai-search-visibility-agent-barsha.pptx` (with speaker notes) / `.pdf`

---

## Kick-off: what the system does (50 words)

The AI Search Visibility Agent compares a brand with up to four competitors on Google (Serper) and in AI assistant answers (OpenAI). It adds brand news (NewsAPI) and SEO/GEO guidelines (Pinecone RAG), calculates visibility scores in code, writes a report with an LLM, fact-checks it with a LangGraph agent, and emails it.

## One unit of value (R)

**One unit of value for this system is: one fact-checked visibility report delivered by email for one brand (with up to 4 competitors and 6 queries).**

---

## Retrofit audit template

**Artifact:** AI Search Visibility Agent (Project 3). The n8n workflow `ai_search_visibility_agent.json` calls a LangGraph fact-checker on Render.

**Primary user journey:** an SEO manager fills in one form (brand, up to 4 competitors, country, up to 6 queries, email). The report, with scores, tables and top actions, arrives by email in about 2–3 minutes.

**Hotspots (compute / data movement)**, counted from the workflow export at maximum input:

| Node | Calls per R | Note |
|---|---|---|
| Wake up fact-checker (Render) | 1 | Every run |
| Serper - Google results | 6 | 1 per query |
| OpenAI - AI answer check (gpt-4o-mini) | 6 | 1 per query. This is the measurement itself |
| NewsAPI - brand news | 5 | 1 per brand. 10 articles fetched, 3 kept |
| Embeddings OpenAI + Pinecone (RAG) | 1 + 1 | **Same fixed question every run**, same 6 passages |
| OpenAI - write report (gpt-5.4-mini) | 1 | Prompt = the **whole dataset as indented JSON**, incl. 6 full AI answers |
| LangGraph - fact-check | 1 request | **2 to ~8 LLM calls inside** (check → verify → fix, max 2 fix rounds). The whole dataset is sent again. A 120 s timeout retries everything |
| Send report by email (SMTP) | 1 | |
| **Total** | **23 from n8n + 2–8 inside the fact-checker** | **9–15 LLM calls per R** |

**Green opportunities (prioritized)**
1. **Quick win - cache the guideline retrieval.** The RAG question is fixed, so retrieve the 6 passages once and reuse them until a guideline PDF changes. *Pillar: energy efficiency. Pattern: Cache static data.*
2. **Quick win - shorter prompts and a leaner fact-checker.** Send compact JSON without the raw AI answers (mentions are already counted in code), re-check only fixed sections, and test a smaller verify model on 10 saved reports before switching. *Pillar: energy efficiency.*
3. **Medium - reuse recent results.** If the same brand, queries and country ran in the last 24 hours, reuse its Google and news data and show the data date. The client can still force a fresh run. *Pillars: energy + hardware efficiency.*
4. **Strategic - weekly runs at greener hours, and delete old data.** Time-shift the planned weekly reports to cleaner grid hours, ask vendors for their regions, and auto-delete n8n executions after 14 days. *Pillars: carbon awareness + hardware efficiency.*

**What I would measure to prove improvement** (2 weeks, per R):
- LLM calls per R (baseline ~12 at average fact-check use, target −20 %)
- tokens per R (target −25 %)
- API cost per R
- run time per R (target under 2 minutes)
- guideline cache hit rate (target over 90 %)
- report quality on 10 sample reports, plus the fact-checker test cases (target: no drop)

**SCI view:** SCI = ((E × I) + M) per R. Solutions 1–3 lower E, and solution 4 lowers I and storage.

**Risks / tradeoffs**
- Cached guidelines or results can be outdated, so refresh on change and show the data date.
- A leaner fact-checker could miss an error, so test it on saved reports first, with no blind downgrade.
- **The AI answer check must stay comparable.** It *is* the product's measurement, so I will not change its model or prompt just to save tokens.
- Time-shifting only works for scheduled weekly runs. On-demand reports must stay fast.

---

## Lever table (10-minute win)

| Lever | Current assumption (honest guess) | Better alternative to explore |
|---|---|---|
| **Model / size** | gpt-4o-mini for the 6 AI answer checks, gpt-5.4-mini for the report, and an OpenAI model on Render for the fact-checker | Keep the AI answer check model fixed (it's the measurement). Test a smaller model for the verify step on 10 saved reports |
| **Call pattern (batch, cache, sync)** | Everything runs live per submission. The fixed RAG question and duplicate runs repeat all calls, and the full dataset is sent twice | Cache guideline passages, reuse same-day results, send compact prompts, re-check only fixed sections |
| **Infra / region / retention** | Vendor-default regions (likely US). n8n keeps every execution. Render is woken every run | Ask vendors for regions and prefer EU or low-carbon regions. Delete executions after 14 days. Schedule weekly runs at greener hours |

---

## Honesty and caveats

- **No "green" or "carbon neutral" claims.** There is no measured carbon figure, only proxies (calls, tokens, cost).
- **Offsets do not lower the SCI.** Cut calls first.
- **What is known vs estimated:** call counts are counted from the workflow export. Tokens, repeat-run share, fact-check rounds and vendor regions are estimates, to be replaced by week-1 measurements.
- **Boundary:** my workflow's API calls. Vendors' data centres, model training and embodied hardware are outside what I can measure.
