# Lab proof · Defend your stack's carbon story

**Path followed: Path B, green retrofit audit** of my Project 3, the [Application Prep Agent](https://github.com/nmarseu/Project-3-Marseu).

**Primary audience:** Head of Career Services at the pilot client.

## Deliverable

- **Deck (13 content slides + title):** [`application_prep_agent_green_retrofit_deck.pptx`](application_prep_agent_green_retrofit_deck.pptx), with a PDF export at [`application_prep_agent_green_retrofit_deck.pdf`](application_prep_agent_green_retrofit_deck.pdf). Speaker notes carry the evidence and pattern links.
- **Audit template:** [`retrofit_audit_application_prep_agent.md`](retrofit_audit_application_prep_agent.md)

## Workflow audited

[`workflow/application_prep_agent.json`](https://github.com/nmarseu/Project-3-Marseu/blob/main/workflow/application_prep_agent.json): 35 n8n nodes, with all LLM steps on `gpt-4o-mini`.

## The run: input → evidence → output

**Input.** The workflow export and the sample inputs in the Project 3 repo: fictional candidate `CV_Sofia_Lindqvist.pdf` and `achievement_bank.md`, plus the `rag_docs/` knowledge base.

**Evidence produced** (by parsing the export's nodes and connections, and measuring the sample files):

| Check | Result |
|---|---|
| External calls per full-pack run | 11: Jina, 4 LLM, 2 Tavily, NewsAPI, embedding, Pinecone, email. 13 if the fact check fails |
| External calls per weak-match run | 10. Research nodes `5`, `5b`, `6`, `7b` feed `Merge Research`, which runs **before** `8. Analyze Fit`, so 5 calls are discarded |
| RAG query | `7b` uses a fixed prompt string, `topK: 6`. The knowledge base is 3 files, 6,344 chars in total |
| Context sizes | Sample CV 1,367 chars; achievements 4,008 chars; job page cap 30,000 chars; company pages 2 × 3,000 chars |
| Repeated context | CV and achievements are inserted into the prompts of nodes 8, 9 and 10; company pages and news into both 9 and 10 |
| Retry behaviour | A failed fact check re-runs `9. Write Report` in full (one retry maximum) |
| Workflow settings | Only `executionOrder` and `binaryMode` are set, so n8n's default execution retention applies |

**Final output.** The deck: defence (R, hotspots, assumptions with a "why should we believe this?" answer, pillar map) → 5 solutions, each with a pillar label and a Green Software Pattern where it genuinely fits → measurement plan → caveats → before/after hypothesis (weak-match runs: 10 → 5 external calls).

## Verify checklist

- [x] One primary audience named (slide 1)
- [x] Every solution maps to at least one pillar (footer chip on slides 7–11)
- [x] No unverifiable claims. No "carbon neutral"; SCI terms explained and limits stated (slide 13)
- [x] Recommendations linked to cost, latency and risk, not only "planet" (slides 2, 7–11)
- [x] 13 content slides plus title (within 8–14)

## One failure / limitation I hit

**I couldn't measure the run itself.** I had no access to live execution logs or OpenAI usage data for this audit, so the call counts are structural facts from the export, but **the token figures are estimates** (characters ÷ 4) and the fact-check retry rate is a guess (1 in 4). OpenAI also doesn't publish energy per token or the grid intensity of the region serving the API, so the deck reports **tokens and calls per R as proxies for E** and makes no grams-of-CO₂e claim. The week-1 baseline in the measurement plan exists to close this gap.

## Sources

- Green Software Foundation patterns: [Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls); [Use right-sized and energy-efficient AI models](https://patterns.greensoftware.foundation/development/right-sized-energy-efficient-ai-models); *Cache static data* and *Delete unused storage resources* (catalog: [patterns.greensoftware.foundation](https://patterns.greensoftware.foundation/))
- SCI formula `SCI = (E × I) + M per R`, as used in the GSF pattern pages
