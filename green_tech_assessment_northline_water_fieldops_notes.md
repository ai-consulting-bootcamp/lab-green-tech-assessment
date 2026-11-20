# Northline Water field-operations copilot — assessment notes

## Path and audience

- **Path:** A — forward-looking green-tech assessment.
- **Primary audience:** COO responsible for field operations; CTO is the delivery partner.
- **Use case:** Northline Water is a fictional municipal utility. Its 120 field technicians use a retrieval-augmented copilot to ask questions about approved maintenance manuals. The copilot retrieves relevant procedure text and writes an answer with a hosted LLM API. It is advisory and does not actuate equipment.

## One unit of value

> One technician question answered correctly from a current approved procedure — without a repeat ask or human escalation.

This is the functional unit **R** used throughout the deck. It makes the assessment business-relevant: one API call is not necessarily one useful outcome, and a wrong answer can create more work.

## First 10-minute lever table

| Lever | Current assumption (honest guess) | Better alternative to explore |
| --- | --- | --- |
| Model / size | A hosted chat model writes every answer; context averages about 2,400 total tokens. | Route simple questions to a smaller model; evaluate 50 representative questions before changing the default. |
| Call pattern | Router + retrieval + answer call on every request; repeated questions recompute. | Cache approved answers; skip the router for obvious intents; re-embed only changed documents. |
| Infra / region / retention | Provider region is unknown; vectors and chat logs are retained by default. | Document an eligible EU region; defer non-urgent embedding/evaluation jobs; set 90-day logs and delete stale vectors. |

## Working assumptions and validation

| Assumption | Confidence | Validation |
| --- | --- | --- |
| About 1,500 questions/day | Medium | Count R in gateway and application logs for two weeks. |
| Two model calls/R and about 2,400 tokens/R | Medium | Trace every model call and token count. |
| Top 50 questions are about 45% of traffic | Low | Cluster normalized questions and review cache safety. |
| Every handbook upload re-embeds the whole library | Medium | Compare changed-document IDs with embedding jobs. |
| Model region and energy data are unknown | Low / unknown | Check account settings, provider documentation, and available provider telemetry. |

## Proposed changes and traceability

1. **Cache approved answers to repeated questions.** Energy + hardware efficiency. Pattern: [Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls/).
2. **Skip the router for obvious intents.** Energy efficiency. Pattern: [Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls/).
3. **Schedule deferrable embedding and evaluation work in an eligible lower-carbon region/window.** Carbon awareness. Pattern: [Use carbon-aware scheduling and region selection for AI workloads](https://patterns.greensoftware.foundation/operations/carbon-aware-ai-scheduling/).
4. **Right-size model/context and retained state.** Hardware + energy efficiency. Patterns: [Use right-sized and energy-efficient AI models](https://patterns.greensoftware.foundation/catalog/ai/compress-ml-models-for-inference/) and [Optimize data storage formats for AI training and inference](https://patterns.greensoftware.foundation/development/data-handling/optimize-data-storage-ai-training/).

## Measurement plan

Run a two-week baseline and change window. Track:

- model calls per R;
- input + output tokens per R;
- cache hit rate;
- cost per R as a business proxy;
- answer quality on a 50-question safety/quality set;
- provider region, storage GB, vector/index refreshes, and retention age.

Use the SCI framing `SCI = ((E × I) + M) per R`: E is energy, I is region/time carbon intensity, M is embodied hardware allocation, and R is the useful answer. Do not turn proxy metrics into an invented grams-CO₂e number.

Reference: [Software Carbon Intensity Specification v1.1](https://sci.greensoftware.foundation/).

## Honest limits

- This is a fictional scenario; traffic, tokens, and repeat share are planning hypotheses, not production measurements.
- The model provider's energy per call is not assumed to be published or directly observable.
- A lower-carbon region does not make unnecessary work efficient; reduce work first, then shift deferrable work where appropriate.
- Caching and smaller models can affect freshness, correctness, and safety. The 50-question quality check is a release gate.
- No “carbon neutral” or “green chatbot” claim is made. Offsets are not treated as a reduction in the software's SCI.

