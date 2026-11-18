# Retrofit audit template: Application Prep Agent (Path B)

**Artifact:** Project 3, *Application Prep Agent*. [github.com/nmarseu/Project-3-Marseu](https://github.com/nmarseu/Project-3-Marseu) (`workflow/application_prep_agent.json`, 35 nodes)

**What it does (50 words):** A career-services tool built in n8n. A user submits a job posting link and a PDF CV through a web form. The workflow reads the posting, researches the company (Tavily, NewsAPI), retrieves writing guidelines (Pinecone), scores the CV–job fit with GPT-4o-mini, writes and fact-checks an application pack, and emails it.

**Primary user journey:** form submit → n8n run (≈ 3 min) → report email. A weak match (score < 50) gets a short note instead of the full pack.

**Unit of value (R):** one completed request: a full application pack or a weak-match note delivered to the inbox.

## Hotspots (compute / data movement)

Call counts are taken from the workflow export. Token counts are estimates (characters ÷ 4).

| Step | Calls per run | Est. input tokens | Issue |
|---|---|---|---|
| Jina job-page fetch | 1 | — | Raw page incl. menus, capped at 30,000 chars, all sent to the parse step |
| 4 Parse job (LLM) | 1 | 2–8k | Largest variable input |
| Tavily ×2 + NewsAPI | 3 | — | Run **before** the fit gate, so thrown away on weak matches |
| Embedding + Pinecone (`7b`) | 2 | ~0 | **Fixed** query string, `topK: 6`, over a 6,344-char knowledge base: same result every run |
| 8 Fit analysis (LLM) | 1 | ~2k | — |
| 9 Write report (LLM) | 1 (+1 on retry) | ~7k | CV, achievements, company pages and news resent |
| 10 Fact check (LLM) | 1 (+1 on retry) | ~6k | Same sources again. A failed check regenerates the **whole** report |
| Email (Gmail SMTP) | 1 | — | Copy kept in Sent folder; n8n keeps every execution |
| **Total, full-pack R** | **11 (13 on retry)** | **~17–23k (+~13k on retry)** | |
| **Total, weak-match R** | **10** | — | 5 of the 10 calls are wasted research |

## Green opportunities (prioritised)

1. **Gate before research** (quick win). Run the fit step on CV + parsed job first, and research only if the score is ≥ 50. *Pillar: Energy.* *Pattern: [Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls).*
2. **Replace the vector search with static guideline text** (quick win). Removes 2 calls per run and a hosted index. *Pillars: Energy, Hardware.* *Pattern: Cache static data.*
3. **Send each fact once; repair only failed sentences** (medium). Clean and cap the job page, pass only selected achievements, do a targeted fix on a failed fact check. *Pillar: Energy.* *Pattern: Optimize agent orchestration.*
4. **Cache company research per company + job URL for 7 days** (strategic, coach mode). *Pillars: Energy, Measurement.* *Pattern: Cache static data (with a freshness rule).*
5. **Right-size, choose the region, keep less** (strategic). Sample-eval a smaller model for job parsing only; EU data-residency project; 7-day error-only execution retention. *Pillars: Energy, Carbon, Hardware.* *Patterns: [Use right-sized and energy-efficient AI models](https://patterns.greensoftware.foundation/development/right-sized-energy-efficient-ai-models); Delete unused storage resources.*

## What I would measure to prove improvement

Over 2 weeks (week 1 baseline, week 2 after opportunities 1 + 2), split by path (full pack / weak match / retry):

- model calls per R and external API calls per R (from the n8n execution log);
- input and output tokens per R (from OpenAI usage);
- fact-check retry rate;
- median run time;
- cost per R (as a proxy only).

**Guardrail:** the first-attempt fact-check pass rate and a 10-report manual review must not drop.

## Risks / trade-offs

- **Quality:** trimming context or using a smaller model can lower quality, which is why both changes come with a sample evaluation.
- **Stale cache:** cached research can go stale; news gets a daily refresh.
- **Static text:** static guidelines only work while the knowledge base stays small.
- **Region:** an EU region is not automatically lower-carbon; claim nothing until the region's grid intensity is known.
- **Unmeasurable parts:** energy per token and embodied carbon at OpenAI are not published, so tokens are a proxy for E, not a measurement.
