# Path B — AI Food Concierge Green Retrofit Audit Notes

## Retrofit audit template

**Artifact:** `evidence/workflow_sanitized.json`, supported by `evidence/restaurant_discovery.py` and local demo results.  
**Primary user journey:** A user submits city, cuisine and optional budget; the n8n conversational agent queries seven synthetic records and returns grounded demo recommendations or a transparent non-match. No real restaurant availability or booking exists.  
**Functional unit (R):** One *correctly resolved restaurant-discovery request*, with an appropriate grounded shortlist or a correctly handled no-match/clarification that respects hard constraints. Record the total number of incoming requests separately to avoid hiding failures.

## Source-of-truth boundary

### Implemented (as-is)

- n8n Chat Trigger → AI Agent using `gpt-4o-mini`.
- Simple Memory configured for `contextWindowLength: 10`.
- JavaScript Code Tool filters 7 fictional restaurant records by city, cuisine and optional budget.
- Prompt says maximum 3 tool calls per user message; runtime-enforced maximum is **not established** from the export.
- No live bookings, availability or public production operations.

### Separate existing proof, not in n8n

- A Python standard-library `restaurant_discovery.py` deterministically extracts a restricted set of preferences, searches a reconstructed synthetic catalog and emits output/trace.
- It is evidence that certain basic discovery journeys can be handled without an LLM, **not evidence that production routing already exists**.
- Its parser has a reproduced limitation: the Spanish cuisine request does not recognize `Spanish`, sets `cuisine = null` and returns unrelated Heidelberg restaurants as nominal matches. Therefore a rules-based route **must only be used when the input is confidently understood**.

### Planned, excluded from today's implementation audit

- Curated real restaurant catalog, external partner APIs, reliable availability and booking actions, broader deployment and user traffic.
- These are addressed only as future scalability implications, not counted as currently measured compute.

## Evidence table

| Evidence | Observed value | Interpretation / caveat |
| --- | --- | --- |
| n8n Test A Greek | ~798 displayed tokens; 2.106 s; Demo Greek Bistro | Successful fictional exact-match demonstration |
| n8n Test B Spanish | ~2,408 displayed tokens; 2.180 s; no concrete alternatives in final output | More displayed tokens without an equivalent recommendation in this one example; not a controlled experiment |
| n8n Test B log view | 3 visible model events, 2 Code Tool events, 3 Memory events | Session history includes previous Greek request; does not establish token causality or event-level exact usage |
| Python Greek replay | `status=ok`, one Greek exact match | Reproduced locally using 7 records extracted from supplied workflow |
| Python Spanish replay | `status=ok` with `cuisine=null` and unrelated matches | Reproduced quality failure / hard-constraint handling limitation |
| Energy / CO2e | Not available | No trustworthy quantified SCI can be reported |

**Token ratio:** `2408 / 798 ≈ 3.02`. This is arithmetic from two approximate UI displays, not a carbon or workload-wide estimate.

## Hotspots (hypotheses)

1. Remote model inference triggered for structured requests that might be solved by deterministic code.
2. Repeated model/tool cycles within an agent run; rationale for individual retries remains unverified.
3. Conversation history and verbose tool data included in later-turn context.
4. Lack of per-request telemetry makes performance, costs and future carbon indicators hard to audit.

The local seven-record Code Tool is not a plausible *primary* energy hotspot relative to remote inference; no comparative kWh measurement has been performed.

## Prioritized retrofit opportunities

| Priority | Problem → proposed change | GSF pillar(s) | Test / guardrail |
| --- | --- | --- | --- |
| P1 | Every request enters the agent → route *recognized, simple* preferences to deterministic discovery; escalate unknown/complex intents | Energy, Hardware | No invalid results or silent loss of cuisine/budget constraints; model calls per correctly resolved R |
| P1 | Prompt-only `3` tool-call instruction → enforce budget and stop conditions in orchestration; bounded fallback exploration | Energy, Measurement | Tool calls/R and alternative usefulness; no silent relaxation of hard constraints |
| P2 | Windowed transcript can include old turns and tool payloads → structured session state + compact contextual summaries | Energy, Hardware | Input tokens on later turns; no degradation of multi-turn preference retention |
| P1→P3 | Sparse execution data → instrument tokens, model/tool events, latency, outcome, cost and responsible retention; document provider region and infrastructure before scale | Measurement, Carbon, Hardware | Better observability; minimal personal data; no implied emissions saving from monitoring alone |

Named relevant Green Software Pattern: [Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls/). We do not force an exact pattern citation for every proposal.

## Measurement plan

- **Week 1:** Baseline with a fixed 20–50-question test set spanning exact match, no-match, unsupported cuisine, conversation follow-up and invalid input; capture actual per-model token usage where available, per-request model/tool count, latency, outcome, and cost.
- **Week 2:** Apply one candidate change at a time to the same cases, compare task quality and efficiency in comparable conditions.
- **Primary metric:** tokens per correctly resolved R, reported alongside **success rate** and **tokens per incoming request**.
- **Secondary metrics:** calls per request, p50/p95 latency, tool error count, cost per R, storage/retention.
- **Illustrative target, not claim:** ≥20% reduction in median tokens per correctly resolved R without a drop in correctness or rise in critical fabricated facts.
- **SCI-style accounting:** `SCI = ((E × I) + M) / R`; E (energy), I (carbon intensity), M (embodied emissions) are currently unavailable. Scope and measurement approach must be established before producing a numeric SCI score.

## Risks and trade-offs

- Over-reliance on deterministic parsing can give wrong matches for unsupported or complex cuisines (reproduced).
- Aggressive search caps can lower exploration quality; quality first, count second.
- Compact memory may discard important constraints; use explicit hard-constraint fields.
- Telemetry can become a privacy/storage burden; store only necessary data with retention controls.
- Hosting in a different region can add latency or conflict with data-governance requirements; verify before change.
- Vendor-token displays are neither electricity readings nor evidence of reduced greenhouse-gas emissions.

## Stakeholder challenge

**Why believe the hotspot hypothesis?** We have the actual orchestration graph, two n8n output screenshots and a visible agent-call trace. The same bootcamp project already implements a non-LLM Python path for simple searches. **What is not proven?** That any specific intervention delivers quantified electricity, CO2e or quality improvement. A controlled experiment is the next step.
