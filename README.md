# MIRA Green Retrofit Audit

**Track:** Module 7 — Green tech · **When:** Week 8, Day 1 · **Status:** Required

This repository contains everything you need for this lab.

## Submission

- **Ironhack lab:** Week 7 — LAB | Defend your stack's carbon story
- **Path:** Path B — Green retrofit audit
- **Artifact audited:** MIRA, Project 3 AI Creative Director
- **Student:** Marija Kavaliauskaite
- **Primary audience:** CTO / technical product owner
- **Functional unit R:** One authenticated MIRA V4 creative-direction journey completed through delivery of one coherent five-frame editorial campaign for one user.

## Methodology

The audit combines the official lab framework with direct inspection of MIRA's architecture, documentation and implementation at commit `c6d9b614f44b30cbce021af24910599f423889e5`. Hotspots are prioritised from verified call paths, retry/reuse logic, retrieval behaviour, persistence and storage—not from invented environmental figures. Assumptions, hypotheses, unknowns and proposed measurements are labelled explicitly.

## Submission file map

- [`MIRA_Green_Retrofit_Audit_Marija_Kavaliauskaite.pptx`](./MIRA_Green_Retrofit_Audit_Marija_Kavaliauskaite.pptx) — title plus 12 content slides for the CTO/technical product owner.
- [`MIRA_Green_Retrofit_Audit_Notes.md`](./MIRA_Green_Retrofit_Audit_Notes.md) — audit boundary, evidence, assumptions, GSF mapping, prioritised improvements, measurements and trade-offs.
- [`instructions.md`](./instructions.md) — official lab instructions.
- [`rubric.md`](./rubric.md) — official assessment rubric.

## Key conclusion

MIRA has concrete efficiency levers—especially persisted reuse, frame-level retry control, evaluated model routing, proportional retrieval and storage lifecycle management—but no direct carbon or energy measurement. The defensible recommendation is to instrument work per R for one to two weeks, test changes behind quality gates and make environmental claims only when supplier energy, hardware and regional grid evidence is available.

**Environmental limitation:** Carbon emissions, energy use, provider hardware, cloud regions, grid carbon intensity, cache-hit rates and percentage improvements have not been directly measured and are not claimed.

## Files

- [`instructions.md`](./instructions.md) — the lab instructions
- [`rubric.md`](./rubric.md) — how your submission is graded; this is what the AI reviewer checks your PR against

## How to complete this lab

1. **Fork** this repository.
2. Do the work described in `instructions.md`, committing to your fork.
3. Open a **pull request** back into this repository.
4. You'll receive **AI feedback** on your PR based on `rubric.md`. Address any blocking feedback and push updates to the same PR.

## Submission hygiene

- Keep this repository scoped to this lab only — no unrelated projects or personal files.
- Use clear, descriptive filenames.
- Remove secrets, API keys, and tokens before committing.
