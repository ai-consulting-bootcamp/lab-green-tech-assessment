# LAB PROOF | Defend your stack's carbon story

## Path / what I submitted

**Path B — Green retrofit audit**, of my previous Ironhack project **CompanyScope**.
**Previous artifact:** https://github.com/sean173-lang/CompanyScope
**This lab repository:** https://github.com/sean173-lang/lab-green-tech-assessment

**Final slide deliverables:**

- [`CompanyScope_Green_Retrofit_Audit.pptx`](CompanyScope_Green_Retrofit_Audit.pptx): editable deck; **title slide + 14 content slides**.
- [`CompanyScope_Green_Retrofit_Audit.pdf`](CompanyScope_Green_Retrofit_Audit.pdf): PDF export.
- [`audit_notes.md`](audit_notes.md): Path B audit template and prioritized improvements.

## The audited workflow

CompanyScope is an AI-assisted company-research system. A user selects a legal entity; an n8n workflow coordinates OpenRegister and Tavily, uses local retrieval and GPT-4o-mini for synthesis, validates sources and returns an HTML/Markdown report. The audit highlights potentially redundant external requests, inference calls and data movement, plus unknown infrastructure utilization.

**Functional unit R:** one *completed, evidence-checked company research report* delivered to a user. An error, draft, retry or model call is **not** another R.

**How the lab was approached:** I used the prior project architecture to identify possible compute and data-movement hotspots, explicitly recorded unverified assumptions, mapped four concrete improvements to the GSF pillars, and designed a 14-day measurement plan. I did **not** pretend to measure production emissions or hardware energy.

## One reproducible run: input → evidence → output

**Source code:** [`audit_proxy.py`](audit_proxy.py) — reads one row per completed report, checks and sums the five workload proxies, calculates each per R, then compares scenarios. Python standard library only.

**Input:** [`sample_events.csv`](sample_events.csv), 16 **synthetic** records representing 8 reports in a hypothetical baseline and 8 in a hypothetical optimized case. Sample row:

```csv
scenario,report_id,model_calls,external_api_calls,input_tokens,output_tokens,latency_ms
baseline,COMP-001,2,4,3200,680,14800
```

**Command executed:**

```bash
python3 audit_proxy.py sample_events.csv --output demo_summary.json
```

**Evidence produced:** the script executed and wrote [`demo_summary.json`](demo_summary.json), with the following computed per-R output (rounded):

| Workload proxy | Hypothetical baseline | Hypothetical proposal | Difference |
| --- | ---: | ---: | ---: |
| Model calls / R | 2.000 | 1.250 | −37.5% |
| External API calls / R | 4.250 | 2.625 | −38.2% |
| Tokens / R | 3,867.5 | 2,470.0 | −36.1% |
| Mean latency / R | 14,937.5 ms | 10,012.5 ms | −33.0% |

**Final output:** the deck documents these as **illustrative hypotheses only** and explains how to collect *real* workload baselines and validate the quality and freshness tradeoffs. The slides do not claim actual percent emissions savings.

## One failure / limitation

**Limitation encountered:** production-level energy consumption, provider inference region, grid electricity carbon intensity, embodied hardware allocation and real report traces were **not available**. That means I could not compute a defensible Software Carbon Intensity score or verify any environmental savings. The supplied CSV is therefore labeled synthetic; it tests the audit method, **not the existing product**. Next step: export privacy-safe n8n execution metrics and vendor usage reports, then run an A/B pilot on matched company reports.

## Self-check against the lab rubric

- [x] Identified **Path B** and linked the previous project artifact.
- [x] Primary audience on title slide: CTO / product owner.
- [x] Explicit functional unit **R** and assessment boundary.
- [x] Hotspots, assumptions, unknowns and skeptical stakeholder challenge.
- [x] Four GSF pillars and **4+ mapped improvements**.
- [x] Traceable named Green Software Patterns in deck / supporting notes.
- [x] Measurement plan, quality controls and an honest no-greenwashing caveat.
- [x] Title + **14 content slides**.
- [x] One actual script execution with input, evidence and final output.
- [x] README maps every committed asset; no unrelated files or credentials.

## Underlying method sources

- [GSF SCI specification](https://sci.greensoftware.foundation/)
- [GSF optimize agent orchestration](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls/)
- [GSF right-sized models](https://patterns.greensoftware.foundation/catalog/ai/compress-ml-models-for-inference/)
- [GSF cache static data](https://patterns.greensoftware.foundation/catalog/cloud/cache-static-data/)
