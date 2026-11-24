# Lab proof · Defend your stack's carbon story

**Student:** Jaime Garate Marquerie · **Path followed: B (green retrofit audit)** · Ironhack AI Consulting, Week 7

**Start here.** This file is the entry point. The deliverable is the deck: [`green_retrofit_audit_editorial_agent.pptx`](green_retrofit_audit_editorial_agent.pptx), with a PDF export in [`green_retrofit_audit_editorial_agent.pdf`](green_retrofit_audit_editorial_agent.pdf). It has 14 content slides plus a title slide.

## 1. Artifact audited

- **System:** Project 3, the *Editorial Research Agent for independent bookshops* (LangGraph).
- **Source:** public repo `jaimegmarquerie-ui/proyecto3-agente-editorial`, commit [`3939562`](https://github.com/jaimegmarquerie-ui/proyecto3-agente-editorial/tree/3939562).
- **What it does (50 words):** a bookseller enters a bookshop profile and an author query. The agent searches the web (Tavily) and fetches editions (Open Library, Google Books) and publisher pages (Tavily). Gemini describes each book and judges it against the profile. The output is a sourced Markdown dossier plus one JSON evidence file per run.

## 2. Workflow (code export)

[`proof/green_audit_metrics.py`](proof/green_audit_metrics.py) reads every saved run file (`evidence/editorial_*.json`). For each run it estimates the external calls the agent made.

- **How the estimate works:** it multiplies the number of attempts and books recorded in each file by the calls each step makes in `editorial_agent/graph.py`:
  - Tavily search: 1 per attempt.
  - Open Library: 1, plus 1 per book.
  - Google Books: 1 per book.
  - Publisher pages (Tavily): 1 per book.
  - Gemini describe: 1 per batch of 3 books.
  - Gemini judge: 1 per attempt.
  - Gemini reformulation: 1 per extra attempt.
- It calls no API and prints no personal data. The author name is only hashed, to count repeats.

## 3. One run: input → evidence → output

- **Input:** the 20 run files in `evidence/` at commit `3939562` (10–13 Nov 2026).
- **Command:** `python green_audit_metrics.py <repo>/evidence green_audit_metrics.json`
- **Evidence produced:**
  - [`proof/green_audit_metrics.json`](proof/green_audit_metrics.json): a summary plus one row per run.
  - [`proof/green_audit_metrics_run_output.txt`](proof/green_audit_metrics_run_output.txt): the console output.
- **Key results** (estimates, not measurements):

| Finding | Value |
|---|---|
| Runs saved / runs with a full R (dossier written, books judged, no tool error) | 20 / 8 |
| Runs without a full R | 12: Gemini 503 ×4, 404 ×2, Cohere 401 ×2, invalid JSON ×1, 3 early test runs |
| External calls per R | ≈ 4 per book reviewed: ~20 for the default 5 books, 33–41 for 9–10 books |
| Gemini calls per full R (median) | 3.5 |
| Calls spent on runs without a full R | ≈ 84 |
| Repeats | Same author in all 20 runs; identical source lists returned up to 4 times |
| Judge acceptance rate | 91 % of judged books accepted |
| Run with a 2nd attempt | 1 (11 Nov, 15:04): ~41 calls instead of ~20 |

- **Final output:** the deck. These numbers feed slide 3 (hook), slides 5–6 (hotspots, evidence chart) and the before/after hypothesis (slide 15).

## 4. Path B retrofit audit template (filled)

The completed template is in [`retrofit_audit_editorial_agent.md`](retrofit_audit_editorial_agent.md). It is also in the speaker notes of slide 2.

## 5. Failure or limitation hit

1. **The run files do not log tokens, latency or energy.** Call counts are reconstructed from the code. No figure in grams of CO₂ is claimed anywhere in the deck.
2. **The early run files are incomplete.** The first 10 runs (10 Nov) have no `author` field and no `books_count`, because the book APIs were not wired in yet. The script shows them as ~2 calls. That undercounts what those runs really did. The repeat analysis therefore uses the query text, which names the same author in all 20 runs.
3. **First version of the script miscounted outages.** The deck draft said "five 503 outages". A check against each file's `error` field showed four. Slides 3, 5 and 6 were corrected before submission.
4. **Development runs, not real traffic.** One author and one profile. The pilot volume (20 dossiers a week) and the repeat share (40 %) are assumptions, labelled as such on slide 7.

## 6. How AI tools were used

Claude (Anthropic), acting as tutor, read the course materials, wrote and ran the metrics script on a clone of the public repo, and drafted the deck. The student chose the artifact and reviewed the conclusions. The Project 3 code itself was written mostly by Codex (OpenAI) from the student's instructions.
