# Path A: levers and assessment rationale

## One unit of value

One unit of value is one eligible support issue correctly resolved by the assistant, without a human handoff or reopening within 48 hours. Count issues, not messages. All failed-attempt and escalation work stays in the resource numerator. A correct answer must match current policy, address the question, avoid invented commitments and protect personal data.

## Fictional client scenario

Northstar Home is a fictional online homeware retailer serving English- and German-speaking customers. A website assistant answers delivery and returns questions, retrieves current public policies and reads authenticated order status. The proposed stack is a web chat, Python application API, PostgreSQL policy store and OpenAI API. The baseline scenario uses GPT-4.1 for routing and drafting. The candidate uses explicit routing, approved FAQ answers and GPT-4.1 mini for grounded drafting, with one larger-model fallback before human handoff. Staff retain refund and exception decisions. No deployment, customer data or measured energy data is claimed. The primary audience is the COO.

## Initial three-row lever table

| Lever | Current assumption (honest guess) | Better alternative to explore |
|---|---|---|
| Model / size | General model used for routing and every answer; no task-specific quality comparison | Use explicit rules and evaluate a smaller candidate on the same labelled cases; retain one bounded fallback |
| Call pattern (batch, cache, sync) | Two calls per incoming issue; recurring FAQs regenerated; background jobs run at a fixed time | Reuse approved public FAQ answers; use direct order lookups; shift only deferrable jobs |
| Infra / region / retention | EU app region; staging runs continuously; diagnostics retained for 90 days; provider location unknown | Schedule staging, index changed policies only, review 30-day diagnostics, verify provider execution region before any geographic claim |

## Prioritized changes

| ID / hotspot | Change | Pillars | Business outcome | Proposed evidence / acceptance | Tradeoff and rollback |
|---|---|---|---|---|---|
| 1 / H1: repeated public FAQs | Reuse approved text keyed by FAQ ID, language, market and policy version; invalidate on edits with a 24-hour maximum TTL | Energy; measurement | Fewer billed calls; quicker answers | Calls/R at least 30% below baseline in cache-only hypothesis; zero critical stale-policy errors in evaluation | Cache storage and match validation cost; bypass cache on ambiguity or stale version |
| 2 / H2: large model everywhere | Rules for status formatting; smaller model for grounded answers; one larger-model fallback then handoff | Energy; measurement | Lower inference spend while preserving service quality | Log calls and tokens separately by model; overall answer correctness >=95%, each language and intent slice >=90%; no slice declines >2 percentage points | Extra fallback calls or worse answers can erase savings; revert affected route |
| 3 / H3: idle capacity and repeated indexing | Staging 10 hours each weekday; change-only indexing; review diagnostics retention from 90 to 30 days | Hardware; energy; measurement | Less idle spend and stored diagnostic data | Scheduled staging time 168 to 50 hours/week (70.2% resource-time reduction); pilot gate >=60% fewer hours, successful restore and deletion checks | Cold starts, urgent testing and audit needs; wake on demand, retain production capacity until tested |
| 4 / H4: fixed-time flexible jobs | Schedule offline evaluation and non-urgent index maintenance within a 24-hour deadline using regional forecasts | Carbon; measurement | Preserve live response speed; support defensible reporting | Actual job times, region, duration and grid factors; zero missed deadlines; compare energy-weighted factors when energy is known | Forecast error and unknown provider execution region; run by deadline if forecast missing |

Numbers above are scenario assumptions or proposed acceptance gates, not results from a deployed service. See [sources.md](sources.md) for the matching official GSF patterns.

## Known, assumed, unknown

- **Known from the task:** Path A is selected; the deliverable is a stakeholder slide deck and repository evidence. The official SCI method and relevant GSF patterns provide the conceptual frame.
- **Assumed for planning:** Client, stack, two-call baseline, traffic, success count, routing shares, staging schedule and retention.
- **Unknown until validated:** Actual quality, demand, safe cache hit rate, model energy per call, provider execution location, facility overhead, physical capacity released and embodied allocation.

## Measurement boundary and carbon accounting

The intended support-service boundary includes application compute, retrieval, cache, model inference, storage, network traffic, background maintenance and work spent on failures. Include both baseline and candidate overhead consistently, including pilot evaluation compute as a separately disclosed one-off cost. Exclude physical delivery logistics and customer devices; this is not a full retailer footprint. Provider training allocation is an unresolved boundary/data question and must be disclosed before publishing an SCI result.

For a common cohort or period, use `SCI = (sum(E_component,time * I_region,time) + sum(M_allocated)) / N_correct_resolutions`. E is kWh, I is gCO2e/kWh and M is gCO2e allocated using an explicit hardware lifetime, time share and reserved-resource share. Match the same boundary, functional unit and accounting basis across comparisons. Do not apply app-region intensity to provider inference without location evidence. Avoid counting facility overhead twice if an energy figure already includes it.

Calls, tokens, cost, reserved instance-hours and storage are useful proxies. They do not establish kWh or gCO2e. PUE describes facility overhead rather than grid cleanliness. Market-based offsets do not lower SCI. Reduced reservations may lower the allocated hardware share, but a shorter bill is not proof that fewer physical machines were manufactured.

## Two-week pilot

1. **Days 1–3:** Eva Fischer instruments baseline and freezes versions. Daniel Reed labels 200 representative/redacted cases, roughly balanced across language and FAQ/order/policy intents. Record difficulty, policy version and expected outcome.
2. **Days 4–7:** Replay baseline and each candidate on identical cases. Preserve per-model calls, input/output tokens, cost, latency, failures and fallback counts. Include cache/routing overhead. Do not send real customer data in the offline pilot.
3. **Days 8–14:** Only if offline gates pass, run a limited randomized live pilot with comparable language/intent mix. Review samples daily. Wait until day 16 for the final 48-hour reopening window.
4. **Decision:** Maya Chen reviews calls/R (target at least 30% lower), actual cost/R (lower, including app/cache costs), p95 latency (<=5 seconds and no worse than baseline), quality thresholds above, and escalation/reopening rates (neither more than 2 pp higher). Zero critical privacy or stale-policy failures is required in the evaluated set. Extend testing if sample uncertainty prevents a confident decision; a small clean sample cannot prove universal safety.
5. **Infrastructure subtest:** Require at least 60% fewer scheduled staging hours and a tested on-demand restart. For scheduling, require zero missed deadlines and collect actual grid evidence; no numeric carbon-saving target is justified yet.
6. **Rebound check:** Report total weekly calls and resource use alongside per-R metrics. More demand can overwhelm efficiency gains.

Proposed telemetry fields: pseudonymous issue ID, cohort, language, intent, route, model/version, policy/cache version, cache hit, input/output tokens, fallback/retry counts, latency, allocated cost, app region, provider region if verified, background job time/duration, provisioned resources, correctness label, handoff and reopen flag. Use a separate access-controlled mapping if re-identification is needed for customer support; avoid raw personal content in metrics.

## Ethical controls and ownership

All people below are fictional scenario assignments, not claims about a real client.

| Named owner | Accountability |
|---|---|
| Maya Chen, COO | Deployment scope, stop/go and off switch (human in command) |
| Daniel Reed, Support Lead | Answer quality, daily monitoring, complaints and refund exceptions |
| Eva Fischer, Engineering Lead | Instrumentation, routing, capacity, forecasts and rollback |
| Leila Hassan, Privacy Lead | Data inventory, vendor/data-location checks and retention review |

Routine policy answers use human-on-the-loop monitoring. Refunds and exceptions go to staff for decisions. Disclose AI use, offer an accessible human route and evaluate both languages and difficult wording. Cache only public content; authenticate order access; redact diagnostics and check deletion across logs, backups and vendor copies. These are proposed safeguards informed by the ethics materials, not a legal-compliance certification or a completed bias audit.

## Slide-title plan

The title slide is separate. The 13 content slides are:

1. Support demand should not mean repeated AI work
2. One unit of value
3. Likely hotspots in the baseline design
4. Assumptions that could change the recommendation
5. Four pillars, four testable interventions
6. Reuse approved public FAQ answers
7. Use rules first, then the smallest adequate model
8. Stop paying for idle and repeated infrastructure
9. Schedule flexible work using grid forecasts
10. A two-week pilot with explicit acceptance gates
11. Before / after: a call-count hypothesis
12. Efficiency must preserve trustworthy support
13. Approve a pilot, not a carbon claim
