# LAB | Defend your stack's carbon story

Ironhack AI Consulting & Integration, Week 7. **Path B: green retrofit audit** of my Project 3 "RCSA Evidence & Challenge Agent" (LangGraph + OpenAI): https://github.com/muratcomez1/AI-assisted-RCSA

**Start here:** [lab_proof.md](lab_proof.md)

## Files

| File | Purpose |
|---|---|
| `lab_proof.md` | Entry point for the reviewer: run, evidence, output, limitation |
| `rcsa_agent_carbon_story_path_b.pptx` | Slide deck (title + 14 content slides, speaker notes included) |
| `rcsa_agent_carbon_story_path_b.pdf` | PDF export of the deck |
| `retrofit_audit_template.md` | Completed Path B retrofit audit template |
| `carbon_evidence.py` | Reads the Project 3 run logs, measures real prompt sizes, builds the before/after per R |
| `carbon_evidence_output.txt` | Output of one run of the script |
| `README.md` | This file map |

## Run

```bash
git clone https://github.com/muratcomez1/AI-assisted-RCSA ../AI-assisted-RCSA
python3 carbon_evidence.py --repo ../AI-assisted-RCSA
```

Python standard library only. It imports the Project 3 code but makes no API calls.
