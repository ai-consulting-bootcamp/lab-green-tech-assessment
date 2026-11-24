# Defend your stack's carbon story · Path B: green retrofit audit of the Editorial Research Agent

**Student:** Jaime Garate Marquerie · Ironhack AI Consulting, Week 7 · **Path B (retrofit audit)**

**Start here:** [`lab_proof.md`](lab_proof.md)

## File map

| File | What it is |
|---|---|
| [`lab_proof.md`](lab_proof.md) | Entry point: artifact, workflow, one run (input, evidence, output), failures and limitations |
| [`green_retrofit_audit_editorial_agent.pptx`](green_retrofit_audit_editorial_agent.pptx) | **The deliverable:** a deck with 14 content slides plus a title slide. Speaker notes on every slide |
| [`green_retrofit_audit_editorial_agent.pdf`](green_retrofit_audit_editorial_agent.pdf) | PDF export of the same deck |
| [`retrofit_audit_editorial_agent.md`](retrofit_audit_editorial_agent.md) | Path B retrofit audit template, filled in (also in the notes of slide 2) |
| [`proof/green_audit_metrics.py`](proof/green_audit_metrics.py) | Script that estimates the external calls in each of the 20 saved runs |
| [`proof/green_audit_metrics.json`](proof/green_audit_metrics.json) | Script output: a summary plus one row per run |
| [`proof/green_audit_metrics_run_output.txt`](proof/green_audit_metrics_run_output.txt) | Console output of the run |

## Deck structure (lab's suggested flow)

| Slide | Intent |
|---|---|
| 2 | Start here: lever table (model, call pattern, infra/region/retention) |
| 3 | Hook: artifact, audience (bookshop owner), Path B, cost / risk / reputation |
| 4 | One unit of value: R = one verified dossier for one author |
| 5–6 | Defense: hotspots, then "why should we believe this?" with an evidence chart from 20 runs |
| 7 | Defense: assumptions, with how sure we are and how we'll check |
| 8 | Pillars map |
| 9–12 | Four solutions: problem → change → business outcome, each labelled with its pillar (one named GSF pattern where it fits) |
| 13 | Measurement plan for 2 weeks, with the SCI view per R |
| 14 | Caveats: no "carbon neutral" claims, offsets vs SCI, what to validate next |
| 15 | Stretch: before/after hypothesis |

## Checklist from the lab (Verify)

- [x] One primary audience named (slide 3: the bookshop owner)
- [x] Every solution maps to at least one pillar (tag at the bottom of slides 9–12)
- [x] No unverifiable claims: no CO₂ figures, only estimated call counts, labelled as estimates
- [x] Recommendations linked to business outcomes (cost, speed, outages, GDPR)
- [x] 8–14 content slides plus title (14 + 1)

## How to reproduce the numbers

```
git clone https://github.com/jaimegmarquerie-ui/proyecto3-agente-editorial
cd proyecto3-agente-editorial && git checkout 3939562
python <path-to-this-lab-folder>/proof/green_audit_metrics.py evidence green_audit_metrics.json
```

The script uses only the Python standard library. It calls no API.
