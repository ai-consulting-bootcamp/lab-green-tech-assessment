# Path A — Lever Table & Speaker Notes

## Use case
AI customer-support ticket summarizer and draft-reply assistant for a mid-sized SaaS company.

## One unit of value
**R = one customer ticket successfully summarized and given a useful draft reply.**

“Successfully” means the output meets an agreed quality threshold based on representative evaluation or human acceptance.

## Lever table

| Lever | Current assumption (honest guess) | Better alternative to explore |
|---|---|---|
| Model / size | One relatively capable general-purpose LLM handles every ticket | Use a smaller model for routine tickets and escalate ambiguous/complex cases |
| Call pattern | Every request triggers inference; duplicate processing may occur | Cache reusable results and add conditional routing before inference |
| Infra / region / retention | Region and retention are chosen mainly for operational convenience | Measure carbon intensity; shift deferrable workloads when appropriate; reduce unnecessary retention |

## Pattern references used
- Use right-sized and energy-efficient AI models
- Optimize agent orchestration to reduce unnecessary model calls
- Reduce transmitted data
- Use carbon-aware scheduling and region selection for AI workloads

## Measurement boundary
Initial hypothesis boundary: inference + relevant data movement + supporting infrastructure. Explicitly document excluded components and shared-infrastructure assumptions before calculating an SCI-style result.

## Suggested 1–2 week baseline
- Calls per R
- Input/output tokens per R
- Cache-hit rate
- Latency per R
- Quality score and escalation rate
- Cost per R
- Energy per R estimate
- Carbon intensity of execution region/time
- Estimated carbon per R

## Defense line
> “Why should we believe this?”

We should believe the *direction of the hotspots* because they follow directly from the workflow architecture: inference, repeated work, prompt size, data movement and utilization are plausible resource drivers. We should **not** believe any exact emissions number until telemetry and boundary assumptions are validated.

## Caveats
- Cost is not carbon.
- Smaller models need quality validation.
- Provider energy data may be incomplete.
- Carbon intensity varies by location and time.
- Do not claim “carbon neutral” without a defensible methodology; offsets are not a substitute for reducing measured software impact.
