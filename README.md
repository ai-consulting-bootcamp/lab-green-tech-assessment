# CompanyScope | Defend Your Stack's Carbon Story

**Ironhack — Green Software & Sustainable AI lab**
**Path B: Green retrofit audit**
**Audience:** CTO / product owner
**Prepared:** 21 November 2026

> **Reviewer: start with [`lab_proof.md`](lab_proof.md).**

This repository contains a 15-slide presentation (**title + 14 content slides**) that defends a green-software assessment of a previous bootcamp artifact, [CompanyScope](https://github.com/sean173-lang/CompanyScope). The assessment links a functional unit **R** to four Green Software Foundation pillars — carbon, energy, hardware, and measurement — and recommends practical optimizations with explicit quality constraints.

## File map

| File | Purpose |
| --- | --- |
| [`lab_proof.md`](lab_proof.md) | **Reviewer entry point:** path, past artifact, reproducible run, input, observed demo output, final deck, limitation |
| [`CompanyScope_Green_Retrofit_Audit.pptx`](CompanyScope_Green_Retrofit_Audit.pptx) | Editable slide deck; title + 14 content slides |
| [`CompanyScope_Green_Retrofit_Audit.pdf`](CompanyScope_Green_Retrofit_Audit.pdf) | Portable export of the same deck |
| [`audit_notes.md`](audit_notes.md) | Retrofit audit template, prioritization, assumptions, measurement plan and traceability |
| [`audit_proxy.py`](audit_proxy.py) | Zero-dependency Python script for per-report workload proxy summaries |
| [`sample_events.csv`](sample_events.csv) | **Synthetic** eight-report baseline/proposal example (not real CompanyScope telemetry) |
| [`demo_summary.json`](demo_summary.json) | Reproducible output of `audit_proxy.py` on the synthetic input |

## Reproduce the hands-on example

```bash
python3 audit_proxy.py sample_events.csv --output demo_summary.json
```

The demo compares **model calls, external API calls, tokens and average latency per completed report**. It does **not** measure electricity consumption or greenhouse gas emissions. The numbers are expressly hypothetical, for illustrating a proposed A/B test; do not report them as real savings.

## The claim and its limitation

**R = one completed, evidence-checked company research report delivered to a user.**

The assessment recommends (1) extend caching, (2) gate and right-size LLM calls, (3) slim prompts and evidence transfer, and (4) reduce idle capacity and retained data. Each suggestion is mapped to at least one GSF pillar and a business or quality outcome.

CompanyScope source architecture is drawn from the prior project context (n8n, OpenRegister, Tavily, local RAG, GPT-4o-mini, validation and HTML/Markdown reports). No production run logs or provider electricity/embodied-carbon data were available for this lab, so **no verified SCI score or CO₂e reduction is claimed**.

## Sources

- [GSF Software Carbon Intensity (SCI) specification](https://sci.greensoftware.foundation/)
- [GSF: Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls/)
- [GSF: Use right-sized and energy-efficient AI models](https://patterns.greensoftware.foundation/catalog/ai/compress-ml-models-for-inference/)
- [GSF: Cache static data](https://patterns.greensoftware.foundation/catalog/cloud/cache-static-data/)
- [GSF Green Software Patterns — Software Engineer](https://patterns.greensoftware.foundation/personas/software-engineer/)

## Submission

Push **this lab folder's files only** to your dedicated lab repository and submit its URL. No credentials or production data are included.
