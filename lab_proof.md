# Lab Proof — Green AI Assessment

## 1. Lab Overview

**Lab:** Defend Your Stack's Carbon Story  
**Path:** A — Forward-looking Green Tech Assessment  
**Use Case:** AI-Powered Customer Support Chatbot

This assessment examines a fictional EU-based retailer using an AI chatbot to handle customer inquiries about orders, deliveries, returns, and refunds.

The objective is to identify potential environmental hotspots and recommend improvements aligned with the four Green Software Foundation (GSF) pillars: Carbon, Energy, Hardware, and Measurement.

## 2. System Description

The fictional system uses the OpenAI GPT-4.1 API and a company knowledge base to generate customer support responses.

**Assumptions:**
- Approximately 1,000 customer inquiries per day.
- A hosted large language model handles customer requests.
- Repeated questions may generate unnecessary model calls.
- Hosting location, energy consumption, and data retention settings have not been verified.

No real customer data or live API was used.

## 3. Functional Unit (R)

**One unit of value (R) is one customer inquiry successfully resolved by the AI chatbot.**

This functional unit allows us to evaluate resource consumption per successful resolution rather than simply counting chatbot interactions.

## 4. Assessment Evidence — Potential Hotspots

| Hotspot | Potential impact |
|---|---|
| Repeated LLM calls | Unnecessary processing and energy consumption |
| Large model for simple requests | Higher computational demand |
| Long prompts and excessive context | Increased token usage and processing |
| Infrastructure and data retention | Potential resource waste and additional storage requirements |

These are assessment hypotheses, not confirmed measurements.

## 5. Three-Row Lever Assessment

| Lever | Current assumption | Better alternative |
|---|---|---|
| Model / size | One large model handles all inquiries | Route simple inquiries to smaller models |
| Call pattern | Repeated questions trigger new LLM calls | Cache approved answers and reduce duplicate requests |
| Infrastructure / region / retention | Hosting and retention settings are unverified | Evaluate lower-carbon hosting, demand-based scaling, and justified retention periods |

## 6. Proposed Improvements

**Improvement 1 — Response caching**  
Reuse approved answers for frequently asked questions.  
GSF pillars: Energy, Measurement.

**Improvement 2 — Model right-sizing**  
Use smaller models for straightforward inquiries, with quality evaluation and escalation when necessary.  
GSF pillars: Energy, Hardware.

**Improvement 3 — Context and data minimisation**  
Reduce unnecessary prompt content and establish appropriate data retention policies.  
GSF pillars: Energy, Measurement.

**Improvement 4 — Infrastructure optimisation**  
Evaluate hosting location, resource utilisation, and opportunities for carbon-aware scheduling where operationally appropriate.  
GSF pillars: Carbon, Hardware.

## 7. Measurement and Validation Plan

The proposed measurement period is two weeks.

Metrics to monitor:
- LLM calls per successfully resolved inquiry (R).
- Average input and output tokens per R.
- Average response latency.
- Estimated energy consumption per R, where reliable measurement data is available.
- API cost per R.
- Customer resolution and answer-quality rates.

Success would mean reducing unnecessary processing and resource consumption while maintaining acceptable response quality.

## 8. Before-and-After Hypothesis

Introducing caching and prompt optimisation may reduce duplicate model calls and token consumption.

The presentation uses illustrative hypotheses of:
- 20–30% fewer duplicate LLM calls.
- 15% fewer input tokens.

These figures are targets for future testing, not observed results.

## 9. Execution Evidence and Limitations

**Execution status:** Conceptual assessment only.

**Input:** Fictional customer support workflow and documented operating assumptions.

**Assessment performed:** Identification of potential environmental hotspots, mapping to GSF pillars, and development of four improvement proposals.

**Final output:** `Green_AI_Carbon_Story1.pdf`

**Limitation encountered:** No operational system, API logs, token usage records, or energy measurements were available. Consequently, actual carbon savings could not be calculated or verified.

**Next validation step:** Test the proposed improvements using representative inquiries and compare performance, quality, resource usage, and cost against a baseline.

## 10. Conclusion

The assessment identifies practical opportunities to improve the sustainability of an AI-powered customer support chatbot through caching, model right-sizing, data minimisation, and infrastructure optimisation.

The recommendations remain hypotheses until validated through real-world measurements. No carbon-neutrality or verified emissions-reduction claims are made.