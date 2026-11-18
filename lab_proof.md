# Lab proof — Green Retrofit Audit, AI Food Concierge (Path B)

**Reviewer entry point.** This proof includes an existing workflow export, a recorded n8n query with its output evidence, locally reproducible Python query executions, and a documented failure. Read the [PowerPoint deck](AI_Food_Concierge_Green_Retrofit_Audit_Path_B.pptx) for the full stakeholder story and [audit notes](audit_notes.md) for the decisions.

## 1. Existing bootcamp artifact

- `evidence/workflow_sanitized.json` — n8n `Restaurant_Reservation_Bot_MVP`: Chat Trigger → AI Agent, GPT-4o-mini, Simple Memory and JavaScript Code Tool using 7 fictional records. Identifiers for credentials/instance/webhook removed for sharing.
- `evidence/restaurant_discovery.py` — existing separate local deterministic discovery implementation. It is **not** a node in the exported n8n workflow.
- `evidence/catalog.synthetic.json` — 7 fiction-only records reconstructed from the uploaded n8n Code Tool for standalone replay; this is **not a live or authorized restaurant catalog**.

## 2. Recorded n8n executions

### Input A (exact match)

```text
Find a Greek restaurant in Heidelberg for under €30.
```

**Observed n8n UI:** AI Agent success in 2.106 seconds, about 798 displayed tokens. Output identifies the fictional `Demo Greek Bistro`, Greek/Mediterranean, €25, with explicit fictional-data disclaimer. [Screenshot](evidence/n8n_test_A_output.png).

### Input B (no exact match)

```text
Find a Spanish restaurant in Heidelberg for under €30.
```

**Observed n8n UI:** AI Agent success in 2.180 seconds, about 2,408 displayed tokens. Final response reports no Spanish restaurant but does **not** offer specific alternatives. [Screenshot](evidence/n8n_test_B_output.png). The [log excerpt](evidence/n8n_agent_logs_crop.png) displays three OpenAI Chat Model events, two Code Tool events and three Simple Memory events for the selected current run; the memory output includes the earlier Greek question. Full per-model token usage, exact tool arguments and execution ID have **not** been archived here.

**Limited observation:** The UI token display for B is approximately `3.02×` A. Because the task and conversation history differ, these two requests do **not** establish a causal source of the increase or a controlled energy comparison.

## 3. Reproduce the existing local deterministic proof

From the repository root, run:

```bash
python evidence/restaurant_discovery.py \
  --input evidence/input.greengreek.json \
  --catalog evidence/catalog.synthetic.json \
  --trace
```

**Reproduced in this lab:** exit code `0`; `output.status = "ok"`; a single exact match `Demo Greek Bistro`; the trace contains `environment = "local-python-runner"`, `n8n_executed = false`, 7 catalog records read, 1 match. Full recorded [output and trace](evidence/local_run_result.json).

This local run invokes **no LLM**. It proves a small deterministic capability, not comparative energy savings or parity with multi-turn n8n conversations.

## 4. Reproduce one failure / limitation

```bash
python evidence/restaurant_discovery.py \
  --input evidence/input.spanish.json \
  --catalog evidence/catalog.synthetic.json \
  --trace
```

**Observed local failure:** despite asking for Spanish cuisine, the parser maps the cuisine to `null` because `Spanish` is not part of its explicitly supported cuisine list. It then reports unrelated Heidelberg venues as matches instead of preserving the cuisine constraint. The script still exits `0` and reports `status="ok"`. Full [failure trace and output](evidence/local_run_spanish_result.json).

**Implication:** A hybrid-routing retrofit needs a reliable confidence/validation gate. Unknown cuisine must trigger clarification or agent escalation, **not** a silent unconstrained rules-path search. This is both a correctness and sustainability guardrail: fewer tokens do not justify invalid recommendations.

## 5. Proposed final output and next test

The [PowerPoint deck](AI_Food_Concierge_Green_Retrofit_Audit_Path_B.pptx) defends four concrete retrofit proposals: hybrid rule/LLM routing, bounded agent loops, compact conversation memory, and telemetry/SCI-ready documentation. A controlled two-week measurement plan is specified; **no retrofit has been implemented in n8n during this audit**. No numerical energy, emissions or SCI reduction is claimed.

Relevant public standards: [GSF SCI Specification](https://sci.greensoftware.foundation/), [GSF agent orchestration pattern](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls/).
