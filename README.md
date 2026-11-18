# Defend your stack's carbon story

**Path A: Northstar Home AI support assistant — fictional scenario.**

Start with [lab_proof.md](lab_proof.md), then review the [slide deck](northstar_support_carbon_assessment.pptx). The deck contains one title slide and 13 content slides. All workload numbers are labelled planning assumptions; no production energy measurement or numerical carbon saving is claimed.

## File map

| File | Purpose |
|---|---|
| [README.md](README.md) | Repository navigation and submission status |
| [rubric.md](rubric.md) | Original grading rubric, preserved and ungraded |
| [lab_proof.md](lab_proof.md) | Reviewer entry point, executed example, failure and requirement crosswalk |
| [northstar_support_carbon_assessment.pptx](northstar_support_carbon_assessment.pptx) | Final editable slide deliverable with detailed speaker notes |
| [lever_table.md](lever_table.md) | Three-row kickoff table, four interventions, measurement protocol and ownership |
| [scenario_analysis.py](scenario_analysis.py) | Reproducible call-count arithmetic; Python standard library only |
| [scenario_inputs.json](scenario_inputs.json) | Explicit synthetic planning assumptions |
| [scenario_results.json](scenario_results.json) | Output from the executed calculation, including sensitivity |

## Reproduce the evidence

```console
python scenario_analysis.py --input scenario_inputs.json --output scenario_results.json
python scenario_analysis.py --resolved 0
```

The second command is expected to fail: a per-resolution metric cannot use zero successful resolutions. No API key, network connection or third-party Python package is required.

## Submission status

Files are prepared locally for review. No commit, push or pull request is authorized by this README. After the user's approval, the course submission uses this GitHub repository and the upstream PR review workflow described in [instructions.md](instructions.md). Course source archives and unrelated projects are deliberately not included.
