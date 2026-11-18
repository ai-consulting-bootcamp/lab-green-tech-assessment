# AI Use Case Identifier – Green Retrofit Audit (Path B)

## 1. Audit scope

**Artifact** — [AI Use Case Identifier architecture](./ai-use-case-identifier-architecture.md)

**Project description (50 words)**

The AI Use Case Identifier helps AI consultants prepare for first meetings. Starting with a company name and website, it researches public sources, describes the business model, and maps processes. It matches those processes against a use case library and produces three recommendations with sources and questions for the client.

**Audience** — AI consultants considering the tool for first meetings and client acquisition.

**Functional unit (R)** — One report in the requested language that a consultant approves for a first client meeting. It contains a credible process map, three relevant recommendations, traceable evidence and assumptions, and questions to discuss with the client. Retries and rework contribute to the effort per accepted report.

**System boundary** — From company name and URL to report delivery, including web research, search API calls, model calls, embeddings, Pinecone queries, and the process graphic when included. External model training and one-time library indexing fall outside this runtime comparison.

## 2. Likely hotspots and quality requirements

- **Process analysis and recommendations.** The configurable reasoning model analyzes the business and its processes and selects the final recommendations. Jinja2 assembles the structured output into the report. A separate image model can produce the process graphic.
- **Matching.** The pipeline retrieves up to eight cards for each of up to five process steps and reranks the results with a model. The code shows where these calls occur. Energy data would establish which stage consumes the most.
- **Process graphics.** Track image generation separately. Hold language and output scope constant when comparing the same report configuration.
- **Repeated runs.** The CLI can render from saved state using `--from-state`, skipping research and matching when the existing sources are current enough for the meeting.

## 3. Prioritized improvements

1. **Reuse current run data · Energy.** Render from saved state when a consultant needs another supported language or rerenders after a template change. This skips research and matching. Translation or image generation may still require calls. Verify that the sources remain current. [Green Software Foundation pattern](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls/)
2. **Generate the language needed for the meeting · Energy.** Select the language before running the workflow. Generate two versions when both are needed. Compared with bilingual output, selecting one language can reduce translation and image generation calls. Count any second version requested later.
3. **Set a retention period · Hardware.** Keep full run data available during active consulting work. After case closure and the agreed retention period, remove intermediate files that the team no longer needs. Retain approved reports and traceable source references as required. Measure the decrease in storage per closed case.
4. **Choose European regions based on electricity mix and data flows · Carbon.** The proposed setup self-hosts n8n in Paris (`eu-west-3`), evaluates Pinecone AWS Serverless in Ireland (`eu-west-1`), and uses an approved OpenAI Europe project (`eu.api.openai.com`) for supported models and endpoints. n8n is a proposed component. OpenAI offers a broad region covering the EEA and Switzerland. Individual sites are unspecified. RTE reports 2025 electricity-generation intensity of about 20 g CO₂e/kWh in France, 237 in Ireland, and 286 in Germany/Luxembourg. These figures describe grid generation. [RTE electricity review](https://assets.rte-france.com/prod/public/pdf/web_download/public/2026-04/2026-04-15-annual-electricity-review-2025-full-report.pdf) · [n8n hosting](https://n8n.io/pricing/) · [AWS regions](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-region-billing-codes.html) · [Pinecone Serverless](https://www.pinecone.io/blog/serverless-generally-available/) · [OpenAI data residency](https://developers.openai.com/api/docs/guides/data-residency)

**GDPR benefit** — Regional storage and processing can reduce international transfers of personal data and help document data flows for clients. Review processor agreements under Article 28 and any transfers under Articles 44 onward. Include subprocessors, support access, logs, backups, and the Tavily search API. Limit client data to what the consultation requires. [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/)

## 4. Two-week measurement plan

- **Comparison.** Evaluate each change separately using the same companies, sources, and quality criteria. Include any later request for a second language in the comparison. Estimate storage after the retention period from actual file sizes.
- **Review.** A consultant checks whether the process map is credible, the three recommendations are specific and relevant, sources and assumptions are traceable, and the questions are useful for the first meeting. Count a report once it meets all four criteria.
- **Metrics.** Track model calls, input and output tokens, image calls, runtime, and API costs per accepted report. Include retries and rework. Track storage per closed case. Record regions and available energy and electricity-intensity data for each service.
- **Success criteria.** Reuse and selective language generation reduce relevant calls per accepted report with a stable acceptance rate. Retention reduces storage per closed case while preserving traceable sources. The regional setup supports the required models and data residency with stable report quality and acceptable runtime.
- **Assumptions to verify.** Some reports are regenerated. One language suffices for some meetings. Intermediate files see less use after case closure. The selected regions and models are available on the chosen plans.

**Emissions evidence** — Calculating SCI requires energy consumption, the carbon intensity of the electricity at the operating location, and attributable embodied hardware emissions. The pilot uses operational metrics while provider data is unavailable. [SCI standard](https://greensoftware.foundation/standards/sci/)

## Slide count

The requested draft contains eight slides including the title. The lab requires eight to fourteen content slides plus a title slide, so this draft is one slide below the formal minimum.
