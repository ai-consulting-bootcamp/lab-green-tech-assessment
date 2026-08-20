# Defend Your Stack's Carbon Story: Green Tech Assessment

This repository contains my submission for the **Green Tech Assessment** lab. I have opted to complete **both Path A and Path B**, applying Green Software Foundation (GSF) principles to two distinct AI architectures.

This `README.md` serves as a map to navigate the committed files and understand the core functional units (**R**) for each assessment.

## 📂 Repository Structure & File Map

The repository is organized into two primary folders representing the two lab paths, as well as the root-level lab instructions and rubric.

### `Path A` — Forward-Looking Green Tech Assessment

This folder contains a forward-looking design assessment for an AI Customer-Support Ticket Summarizer.

- **`green_stack_carbon_path_a_akansha.pdf`**: The main 12-slide stakeholder presentation deck defending the carbon story and proposing four GSF-aligned optimizations.
- **`lever_table_and_speaker_notes.md`**: Contains the mandatory 3-row lever table, baseline measurement plan, and speaker notes mapping to the deck.
- **`sources.md`**: Links to the specific Green Software Patterns and SCI standards referenced in the assessment.

### `Path B` — Green Retrofit Audit

This folder contains an architecture-grounded retrofit audit of an existing production application, the AI Delivery Risk Assistant.

- **`delivery_risk_assistant_carbon_audit.pdf`**: The 14-slide stakeholder deck auditing the existing pipeline (ingestion, retrieval, LLM reasoning, and scheduled executions) and proposing concrete code-level fixes.
- **`retrofit_audit.md`**: The completed retrofit audit template detailing hotspots, prioritized opportunities, the SCI boundary, and before/after hypotheses.

### `Root Level`

- **`README.md`**: This file, acting as the submission map.
- **`instructions.md`**: The original lab instructions and requirements.
- **`rubric.md`**: The grading criteria used to evaluate this submission.
- **`Path A`**: Forward-Looking Green Tech Assessment
- **`Path B`**: Green Retrofit Audit of Project 3 (`delivery-risk-assistant`)

## 📊 Executive Summaries

### Path A: AI Customer-Support Ticket Summarizer

- **Target Audience:** CTO / Head of Engineering.
- **Functional Unit (R):** One customer ticket successfully summarized and given a useful draft reply.
- **Core Strategy:** Avoid vanity reduction claims by scaling environmental impact strictly against business value delivered. Key recommendations include right-sizing models, implementing conditional caching to stop repeating work, reducing transmitted data, and utilizing carbon-aware scheduling for background batch jobs.

### Path B: AI Delivery Risk Assistant (Retrofit)

- **Target Audience:** CTO / VP Engineering.
- **Functional Unit (R):** One completed project risk audit producing validated, evidence-grounded findings.
- **Core Strategy:** Eliminate redundant compute and API calls without removing essential quality/safety gates. Key recommendations include batching embedding calls, fingerprinting chunks before re-embedding, caching deterministic LLM outputs, and making the weekly `n8n` cron jobs change-aware.

