# MIRA Green Retrofit Audit Notes

## Audit identity

- **Path:** Path B — Green retrofit audit
- **Artifact audited:** MIRA V4 Brand World, Project 3 AI Creative Director
- **Student:** Marija Kavaliauskaite
- **Primary audience:** CTO / technical product owner
- **Evidence baseline:** MIRA commit `c6d9b614f44b30cbce021af24910599f423889e5`

## 50-word system description

MIRA is an authenticated AI creative-director application that guides a user through structured brand discovery, synthesises Creative DNA, deterministically compiles an editorial campaign, and generates five initial, five refined, and five final visual outputs. It persists journey state and generated assets while using provider-backed text, image, and optional embedding services.

## Primary user journey

An authenticated user supplies quick context and bounded recognition/creative-discovery evidence, receives a structured Creative DNA, reviews initial visual directions, performs one bounded refinement, and receives a coherent five-frame editorial moodboard. The final frames represent: world opening, human presence, material intelligence, architectural pause and closing continuity.

## Functional unit R

**One unit of value (R) is one authenticated MIRA V4 creative-direction journey completed through delivery of one coherent five-frame editorial campaign for one user.**

This adjusts the suggested wording only to identify the implemented V4 authenticated path and its completion condition precisely.

## System boundary

**Included:** recognition and creative-discovery model work where triggered; Creative DNA synthesis; deterministic Campaign Compiler; optional embedding/retrieval operations; initial, refined and final image generation; database reads/writes; object transfer/storage; reuse and retries from journey start through delivery.

**Excluded or unknown until evidenced:** end-user-device energy; provider energy use; model-serving/hosting regions; grid carbon intensity; provider hardware and embodied-emissions allocation. These exclusions remain visible and prevent an unsupported SCI or footprint claim.

## Compute hotspots and repeated operations

| Hotspot | Repository evidence | Evidence status / likely repeated work |
| --- | --- | --- |
| Image generation | `server/miraV4/router.ts` maps five initial references, five refined prompts and five final prompts to provider image calls; final completion requires five references. `server/_core/imageGeneration.ts` defaults to `MODEL_GPT_IMAGE_2`. | **Known call structure; environmental magnitude unknown.** The implemented full path schedules 15 image requests before retries. Failed/missing frames are the strongest checkpointing candidate. |
| Text-model work | `server/miraV4/creativeDna.ts` identifies `gpt-5-mini` and performs one structured Creative DNA synthesis. Adaptive-question services invoke model work only where triggered and provide deterministic fallbacks. Campaign Compiler is deterministic. | **Known architecture; tokens/energy unknown.** Candidate for evaluated task routing, request tracing and prevention of duplicate synthesis. |
| Retry/reuse | `server/miraV4/router.ts`, `server/miraV4/db.ts` and architecture docs use source fingerprints plus `in_progress`, `complete` and `retryable_error`; completed visual stages return persisted outputs. | **Known stage-level reuse.** Per-frame recovery and real retry rates are **measurement needed**. |
| RAG/embeddings | `server/miraV4/knowledgeRag.ts` uses lexical fallback when embeddings are not configured; otherwise `text-embedding-3-small` is supported and corpus embeddings are cached in `semanticIndexCache` by provider/model/source versions. | **Known conditional path.** Query embedding and retrieval operations per R are unknown; incremental corpus updates are an opportunity. |
| Persistence/storage | MIRA documentation identifies owner-scoped MySQL/TiDB journey records and S3-backed generated/uploaded assets. | **Known components; unknown footprint.** Retention, bytes, regions, data movement and GB-days are **measurement needed**. |

## Current assumptions and unknowns

- **Hypothesis:** image generation is the largest compute concentration because the full implemented path schedules 5 + 5 + 5 provider requests and staging latency was material. No energy or carbon magnitude is claimed.
- **Hypothesis:** fewer duplicate/retried provider calls should reduce operational work per R while improving cost, latency and reliability.
- **Assumption to test:** a smaller/faster text model may preserve quality for bounded adaptive or structured tasks; no blind downgrade is recommended.
- **Unknown:** provider energy, hardware, model efficiency, serving location and grid carbon intensity.
- **Unknown:** production tokens, call counts, retry rate, cache/reuse rate, asset volume, retention and abandonment rate.
- **Unknown:** whether provider request-level idempotency prevents billed/processed duplicate work.
- **Measurement needed:** identical R boundary and quality rubric for baseline and retrofit comparisons.

## Four-pillar mapping

| Pillar | MIRA interpretation | Evidence/measure |
| --- | --- | --- |
| Carbon | Time/region shifting is not yet defensible because provider placement and grid intensity are unknown. | Obtain supplier region/time and auditable carbon-intensity inputs before `gCO2e/R`. |
| Energy | Reduce unnecessary model, embedding, transfer and storage operations for the same accepted five-frame R. | Calls/R, tokens/R, embeddings/R, retries/R and latency/R. |
| Hardware | Use fit-for-purpose models and avoid retaining unused intermediate assets. | Model-tier mix and stored GB-days/R; actual hardware remains unknown. |
| Measurement | Trace every journey, stage, model, frame, retry, reuse, byte and cost to R. | Trace completeness, reuse rate and quality acceptance; cost is not carbon. |

## Prioritised opportunities

### Quick win — frame-level checkpointing and idempotency

- **Problem:** stage-level reuse exists, but the repository does not evidence independent recovery of each successful/failed frame.
- **Change:** persist per-frame state, carry idempotency keys through provider calls, retry only missing frames, classify errors and cap attempts.
- **Operational hypothesis:** fewer duplicate and retried image calls per R; improved latency, cost and reliability without reducing five-frame completeness.
- **Pillars:** Energy, Carbon (conditional), Measurement.
- **Relevant GSF pattern:** “Optimize agent orchestration to reduce unnecessary model calls” applies in principle; implementation benefit must be measured.

### Medium effort — quality-gated model routing

- **Problem:** one model tier is identified for several bounded text tasks with different complexity.
- **Change:** keep deterministic work local; evaluate a smaller/faster model for adaptive questions and structured synthesis; escalate when schema or quality checks fail.
- **Operational hypothesis:** lower tokens/latency/cost per accepted R where quality is non-inferior. Cheaper is not assumed to mean greener.
- **Pillars:** Energy, Hardware, Measurement.
- **Relevant GSF pattern:** “Use right-sized and energy-efficient AI models.”

### Medium effort — proportional image retry and concurrency

- **Problem:** provider exhaustion and retryable states are evidenced; retry frequency and burst reliability are not measured.
- **Change:** checkpoint each frame, queue/stagger bursts where testing supports it, separate transient/quota/permanent errors and protect successful outputs.
- **Operational hypothesis:** fewer unnecessary regenerations and more reliable completion per R.
- **Pillars:** Energy, Carbon (conditional), Measurement.

### Medium effort — proportional RAG and embeddings

- **Problem:** semantic retrieval can perform query embeddings and build corpus embeddings; actual operation counts are unobserved.
- **Change:** preserve lexical fallback where quality is sufficient, reuse cached corpus vectors, embed only changed items and log query/corpus operations.
- **Operational hypothesis:** fewer embedding and retrieval operations per accepted R with equivalent evidence quality.
- **Pillars:** Energy, Hardware, Measurement.
- **Relevant GSF pattern:** “Cache static data” applies to stable approved-corpus representations, subject to invalidation/freshness controls.

### Strategic — storage lifecycle and supplier-backed accounting

- **Problem:** generated assets persist through database and S3-backed storage, but retention and carbon inputs are unknown.
- **Change:** define lifecycle rules for initial/refined/final, abandoned and superseded sets; verify deletion; obtain provider energy, region and hardware-allocation evidence.
- **Operational hypothesis:** lower stored GB-days and data movement per R; carbon claims remain deferred until evidence exists.
- **Pillars:** Hardware, Energy, Carbon, Measurement.

## Risks and trade-offs

- Lower-tier models can reduce quality and increase regeneration; quality evaluation is a release gate.
- Caching can introduce stale-state/invalidation risk.
- Short retention can reduce reproducibility, auditability or user value.
- Retry caps can reduce completion during provider incidents.
- Queuing can improve reliability but increase waiting time.
- A boundary omitting provider services or user devices can understate impact.
- Cost can change independently from energy/carbon and must remain an operational proxy only.

## Measurements needed — one to two weeks

1. Assign an R/journey trace ID and stage/frame identifiers.
2. Capture model, tokens, image calls, retry reason/count, embedding/retrieval operations, reuse status, latency, bytes and cost.
3. Baseline representative completed, abandoned and retryable journeys.
4. Test checkpointing and conditional routing behind feature flags.
5. Compare the same R boundary and editorial-quality rubric; roll back on quality or safety regression.

Primary metrics: model calls/R, image-generation calls/R, retry rate/R, tokens/R, embedding operations/R, retrieval operations/R, latency/R, cost/R, reuse rate, object bytes/R and GB-days/R.

**Cost is NOT a direct carbon measurement.** Add energy or `gCO2e/R` only when energy, provider region/time, grid intensity and hardware allocation are supported by auditable evidence.

## Evidence references

- `MIRA_SYSTEM_BRIEF_FOR_PEER_AUDIT.md`
- `docs/MIRA_AI_AND_DATA_INVENTORY.md`
- `docs/MIRA_ARCHITECTURE_FOR_AUDIT.md`
- `docs/MIRA_V4_CURRENT_STATE.md`
- `docs/V4_REFINEMENT_RETRY_VALIDATION.md`
- `server/miraV4/router.ts`
- `server/miraV4/creativeDna.ts`
- `server/miraV4/campaignCompiler.ts`
- `server/miraV4/adaptiveQuestions.ts`
- `server/miraV4/knowledgeRag.ts`
- `server/miraV4/db.ts`
- `server/_core/llm.ts`
- `server/_core/imageGeneration.ts`
- `server/storage.ts`

No MIRA source code is copied into this lab repository.

## External pattern references

- Green Software Foundation, Software Carbon Intensity: https://sci.greensoftware.foundation/
- Green Software Patterns, Cache static data: https://patterns.greensoftware.foundation/catalog/cloud/cache-static-data/
- Green Software Patterns, Development catalog: https://patterns.greensoftware.foundation/development/

These references inform the framework and pattern names. They do not provide MIRA-specific environmental measurements.

## Environmental claim boundary

MIRA's environmental impact has not been directly measured. This audit does not claim carbon neutrality, a carbon footprint, energy use, hardware characteristics, cloud region, cache-hit rate, grid intensity, model-efficiency values or percentage improvements. Every proposed benefit is a hypothesis to test against a measured baseline.
