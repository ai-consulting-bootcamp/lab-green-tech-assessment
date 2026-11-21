# CompanyScope — Path B retrofit audit notes

## 1. Previous project / source artifact

**Source repository:** https://github.com/sean173-lang/CompanyScope
**Lab repository:** https://github.com/sean173-lang/lab-green-tech-assessment
**Audit scope:** CompanyScope's documented orchestration design and opportunities to reduce repeated work; **not** a deployment-level emissions audit.

**~50-word artifact description:**
CompanyScope is an AI-assisted company-research workflow built during an Ironhack bootcamp. A user identifies a company; n8n orchestrates structured company and registry lookups, Tavily research and local retrieval. GPT-4o-mini helps synthesize findings. Validation checks evidence, and the system produces HTML or Markdown reports for review. The audit focuses on redundant work and computation.

**Known project context:** n8n orchestration (previously described as 34 nodes); OpenRegister, Tavily, local RAG, GPT-4o-mini; validation; HTML/Markdown reports; caching and budget safeguards. These are design facts from prior project context and are **not fresh independent code inspection or runtime profiling**.

## 2. SCI functional unit and system boundary

> **R = one completed, evidence-checked company research report delivered to the requester.**

Count a report **only** when it passes identity, provenance and freshness checks and its output is delivered. Preview, failed report, repeated model call and incomplete run do not count as separate R. An optional financial data phase is included only when explicitly requested in that report.

**Proxy measurement boundary:** application intake/orchestration, registry/search requests, LLM inference calls/tokens, retrieval/data volume, validator and report-rendering latency, storage retention. **Unknown external quantities:** provider GPU and data-center kWh, vendor geography/grid intensity, datacenter utilization and embodied-emissions allocation.

The Green Software Foundation's SCI relationship is `SCI = ((E × I) + M) / R`, where E is operational energy, I its carbon intensity, M the embodied impact allocation and R the functional unit. We do **not** have verified E, I or M, so the sample is **not SCI**.

## 3. Retrofit audit template

| Dimension | Finding / plan | Confidence |
| --- | --- | --- |
| Artifact | CompanyScope source repo and reported n8n research flow | Prior project context |
| Primary user journey | company intake → OpenRegister/Tavily + RAG → GPT-4o-mini → validation → report | Prior project context |
| Hotspot: external calls | repeated company/registry searches on the same legal entity | Plausible, unmeasured |
| Hotspot: inference | unconditional summarization or branching / retry loops | Plausible, unmeasured |
| Hotspot: data movement | documents and news sent repeatedly to prompts | Plausible, unmeasured |
| Hotspot: hardware | idle development runners, excessive file retention | Unknown; confirm environment |
| What to measure | provider calls, cache hits, LLM calls/tokens, bytes, cost, latency and QA pass rate **per R** | Can instrument |
| Risks | stale registry evidence, loss of citations, low-quality small-model output, privacy/retention violations | Requires tests |

## 4. Prioritized green opportunities

| Priority | Problem → Change | GSF pillar(s) | Success signal | Quality / risk guardrail |
| --- | --- | --- | --- | --- |
| Quick win 1 | Duplicate lookups → normalize entity keys and cache stable registry facts with per-source TTL | Energy, measurement | fewer external calls / R | explicit refresh / expiry; protect freshness |
| Quick win 2 | Redundant inference → deterministic routing before generation | Energy, hardware | fewer model calls / R | no silent skipping of ambiguous entities |
| Medium 3 | Large prompts → remove duplicate text, use top relevant passages and token caps | Energy, measurement | fewer input + output tokens / R | maintain citation coverage and qualifications |
| Medium 4 | Oversized models → benchmark task-appropriate models against fixed quality set | Energy, hardware | token cost and latency / R | hold-out validation before rollout |
| Strategic 5 | Idle services/retained files → on-demand execution and expiry schedules | Hardware, energy, carbon | fewer idle instance-hours + GB-days | lawful retention; no loss of required evidence |
| Strategic 6 | Non-urgent workloads → compare carbon-aware time/region options | Carbon, measurement | provider-reported regional intensity where available | respect GDPR, residency, security and latency |

These fit established concepts in the [GSF Patterns catalog](https://patterns.greensoftware.foundation/); source links and exact named patterns appear in `README.md`. The region and retention ideas are **conditional**, not claims about the current deployment.

## 5. Defending the assessment

**Skeptical question:** Why believe redundant work is the primary carbon hotspot if nobody measured kWh?

**Answer:** We should **not** claim it is definitively the largest emitter. We know the application includes repeated-call candidates: company lookups, retrieval and LLM generation. Requests, token counts and caching behavior are instrumentable and controllable; they are a defensible **first optimization hypothesis**. The engineering plan requires real measurement before reporting savings.

## 6. Measure over 14 days

- **Days 1–3:** instrument baseline and map every completed report to one stable `report_id`, provider, model, tokens, cache decision and execution duration.
- **Days 4–10:** enable cache normalization, conditional model calls and prompt limits one at a time; perform matched report cases and human review.
- **Days 11–14:** compare calls / R, external requests / R, tokens / R, median latency, cost proxy and quality; roll back if entity accuracy, source freshness or citation coverage degrades.
- **Later:** request valid provider energy, geography and amortized hardware data; estimate SCI only for a declared boundary and R.

**Pilot targets to discuss, not promises:** 20% fewer duplicate external calls/R, 15% fewer model tokens/R and zero critical regressions in source or entity matching. Targets are proposed success criteria, not observed results.

## 7. Three-row lever table (the Path A lens, used as an extra cross-check)

| Lever | Current assumption (to validate) | Better alternative to explore |
| --- | --- | --- |
| Model / size | GPT-4o-mini supports synthesis; multiple passes may be avoidable | deterministic routing; benchmark lower-cost steps with quality gates |
| Call pattern | multiple providers and agent branches could repeat work | cache with source-specific TTL; dedupe and halt when goal is reached |
| Infrastructure / region / retention | runtime region and retained file lifetime not verified | measure idle resources; expire temp data; compare compliant regions |

## 8. Synthetic measurement illustration

Run `python3 audit_proxy.py sample_events.csv --output demo_summary.json`. The CSV contains **fictional workload records** for 8 reports in each scenario. The program produces: **2.0 → 1.25 model calls/R (−37.5%)**, **4.25 → 2.625 API calls/R (−38.2%)**, **3867.5 → 2470 tokens/R (−36.1%)** and **14,937.5 → 10,012.5 ms mean latency/R (−33.0%)**. This is a **demonstration of the measurement method**, not performance data from the CompanyScope codebase.

## 9. Caveats

- Workload proxies and model costs are **not direct electricity or CO₂e measurements**.
- Not enough evidence to assert energy savings, grid mix, hardware footprint or carbon neutrality.
- Repeated requests sometimes carry legal or freshness reasons; cache TTL, source authenticity and consent matter.
- `CompanyScope` source materials were not exported into this lab repo; the link points to the **separate past project**. The lab repository intentionally contains only lab-specific assets.
- No offsets are used to cancel an SCI score. SCI is an intensity methodology, not a carbon-offset claim.
