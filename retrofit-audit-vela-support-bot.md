# Retrofit audit notes: Vela support bot (Path B)

Companion to the deck [`green-retrofit-audit-vela-support-bot.pdf`](./green-retrofit-audit-vela-support-bot.pdf). It holds the Path B kick-off, the filled audit template, the evidence behind the numbers, and the speaker notes for each slide.

**Path followed:** Path B, green retrofit audit. **Primary audience:** Vela's CTO.

## 1. Kick-off

**Artifact:** my week-5 lab "Fully automated Help & Support Pages with Chatbot and Human escalation".
- Repo: https://github.com/benmayer/lab-multi-app-integration (PR #8 to `ai-consulting-bootcamp/lab-multi-app-integration`)
- Local path: `course work/week-5/lab-multi-app-integration/` (`lab_proof.md`, `support-bot/index.html`, `workflow_export.json`)
- Live widget: https://tools.ben-mayer.com/support-bot/
- n8n workflow: "Ben's Support Agent" (one workflow, 38 nodes)

**What it does (about 50 words):** Vela Support Bot is a website chat for a fictional finance app. An n8n RAG agent answers visitor questions from Notion help pages indexed in Pinecone, with Cohere reranking and an OpenAI model. When the docs can't answer, it escalates to the owner on Telegram, and the owner's reply is delivered back into the chat.

## 2. Retrofit audit template

**Artifact:** Vela support bot (n8n + Pinecone + Cohere + OpenAI + Telegram + Cloudflare-hosted widget), see section 1.

**Primary user journey:** a visitor opens the help page → asks a question in the chat → the agent searches the Notion-sourced docs and answers → if the docs run out and the visitor agrees, the agent saves an escalation row and pings the owner on Telegram → the owner replies → the widget's poll picks up the reply and shows it as a "Support team" message.

**Hotspots (compute / data movement):**
- **H1 Model calls.** The RAG agent uses Pinecone as a *tool*. On a searched turn that means one LLM call to decide to search and one to answer. An escalation turn adds calls for `save_escalation` and `notify_human_telegram`. Each call carries 5 chunks and the memory window.
- **H2 Idle polling.** The widget polls `GET /webhook/support-replies` every 5 s for 30 min after every visitor message. It does this whether or not anything was escalated, and it doesn't stop when the reply arrives. That is up to 360 n8n executions per conversation.
- **H3 Repeated work.** The same FAQ questions are embedded, searched, reranked and answered from scratch each time.
- **H4 Stored waste.** Every execution is saved until n8n prunes it, Pinecone holds duplicate chunks for one page from early test runs, and escalation rows never expire.
- Minor: two Notion triggers poll hourly (48 calls/day, almost always empty). Every minute was only for testing, and daily is enough for a help centre. Re-embedding only runs on page edits.

**Green opportunities (prioritized):**
1. **Quick win: S1.** Poll only after an escalation, stop on the reply, back off 5 → 15 → 30 s. Server-side, switch the Notion triggers from hourly to daily (48 → 2 checks a day). Pillars: energy, hardware. Pattern: [Keep request counts low](https://patterns.greensoftware.foundation/development/web-performance/keep-request-counts-low).
2. **Quick win: S4.** Don't save successful poll executions (keep counters instead), use deterministic chunk ids, purge duplicates, expire delivered escalations after 30 days. Pillars: hardware, measurement. Patterns: [Delete or auto-expire unused storage](https://patterns.greensoftware.foundation/operations/resource-lifecycle/delete-or-auto-expire-unused-storage), [Remove unused assets](https://patterns.greensoftware.foundation/operations/resource-lifecycle/remove-unused-assets).
3. **Medium, the biggest energy lever: S3.** Retrieve first and then make one LLM call, send the top 3 reranked chunks, skip retrieval on "yes/thanks" turns, and keep `gpt-5.4-mini` with any smaller model gated by a golden set. Pillars: energy, hardware, carbon. Patterns: [Optimize agent orchestration to reduce unnecessary model calls](https://patterns.greensoftware.foundation/development/optimize-agent-orchestration-reduce-model-calls), [Use right-sized and energy-efficient AI models](https://patterns.greensoftware.foundation/development/right-sized-energy-efficient-ai-models).
4. **Medium: S2.** Cache answers for repeated FAQ questions, invalidated by the Notion update trigger. Pillars: energy, carbon. Pattern: [Cache static data](https://patterns.greensoftware.foundation/development/data-handling/cache-static-data).
5. **Strategic: S5.** Co-locate n8n and Pinecone in a low-carbon EU region close to users, check OpenAI EU residency, and time-shift re-embedding. Pillars: carbon, measurement. Patterns: [Choose the region that is closest to users](https://patterns.greensoftware.foundation/architecture/system-topology/choose-region-closest-to-users), [Use carbon-aware scheduling and region selection for AI workloads](https://patterns.greensoftware.foundation/operations/carbon-aware-ai-scheduling).

**What I would measure to prove improvement:** per R (one resolved support conversation): n8n executions, LLM calls, input/output tokens, € cost across OpenAI + Cohere + Pinecone, and polls that returned nothing. Guardrails: golden-set correctness (30 questions), escalation rate, p95 latency. Week 1 is the baseline, week 2 runs with S1 + S4 and a first cut of S3. Full plan on deck slide 12.

**Risks / tradeoffs:**
- Backoff polling delays a human reply by up to 30 s. Daily Notion polling means a doc edit can take up to a day to reach the bot (run the workflow by hand for urgent fixes).
- Less context and fewer calls can make answers worse, so the golden set gates every change.
- A cache can serve stale answers if invalidation misses a page edit.
- Dropping execution logs makes debugging harder, so counters replace them.
- A region move is a migration with plan and vendor limits.

## 3. Evidence behind the numbers

| Claim in the deck | Source |
|---|---|
| Poll every 5 s for 30 min, after every message, never stops on reply | `support-bot/index.html`: `POLL_EVERY_MS = 5000`, `POLL_MAX_MS = 30 * 60 * 1000`, `startPolling()` in the submit handler's `finally`. `pollOnce()` never clears the timer |
| 360 polls in the tail | 12 polls/min × 30 min, only while the tab is visible (`document.hidden` check) |
| Model, retrieval, rerank, memory | Live n8n config, read 26 Nov 2026: `OpenAI Chat Model` = `gpt-5.4-mini`, `Retrieve from Pinecone` mode `retrieve-as-tool`, `topK: 5`, `useReranker: true` (Cohere), `Simple Memory` = buffer window (default size), embeddings 512 dims, text splitter default chunk size with 100 overlap |
| Notion polling | Both Notion triggers set to `everyHour`. "Every minute" in the week-5 proof was a testing setting; daily is proposed in S1 |
| Trace #2204 timings | `lab_proof.md` sections 4 and 6: row created 11:45:07, Save Reply 11:45:50, `delivered` flipped 11:45:54 |
| Only 1 execution retained | n8n executions list for the workflow on 26 Nov 2026 returned a single execution (#3875, Notion trigger DNS error, 15 Nov). Everything else had been pruned |
| Duplicate chunks | Known leftover noted in `lab_proof.md` section 2b |
| Pinecone region us-east-1 | The index is on Pinecone's free Starter tier, which only runs on AWS us-east-1. Moving to an EU region needs a paid plan |

Numbers on slides 7 and 13 are **hypotheses** from these sources, not measurements. Assumptions behind them: 3 visitor turns per conversation, 15% escalation rate, a tab left visible for the whole 30-minute tail (worst case).

## 4. Lever summary (Path A table, used here as a one-glance recap)

| Lever | Current state (from the audit) | Better alternative to explore |
| ----- | ------------------------------ | ------------------------------ |
| Model / size | `gpt-5.4-mini` as an agent, ≥2 calls per searched turn, 5 chunks + memory each call | Retrieve first, then one call with the top 3 chunks. A smaller model only for routing, and only if it passes the golden set |
| Call pattern (batch, cache, sync) | Synchronous, no cache. The widget polls every 5 s for 30 min after every message | Cache repeated FAQ answers. Poll only after escalation, with backoff, and stop on reply (later: push) |
| Infra / region / retention | Pinecone on us-east-1 (free tier), n8n region unknown. All executions saved, duplicate vectors, escalations kept forever | One low-carbon EU region close to users. Counters instead of poll logs. Deterministic chunk ids. 30-day expiry |

## 5. Speaker notes

**Title.** Path B: I'm auditing something I built three weeks ago, as if a client handed it to me. The audience is Vela's CTO, and the decision I want is a 2-week measured trial.

**1 Hook.** Every visitor message touches OpenAI, Cohere, Pinecone and n8n, and each bills per call. Green and cheap point the same way here. Be careful with the reputation point: a finance brand making green claims without numbers is a greenwashing risk, which is why this deck makes none.

**2 R.** R is a resolved conversation, not a message. A per-message R would make a chattier bot look more efficient. R can be counted today from the escalation table plus chat sessions. The boundary is explicit, and M is out because we have no vendor hardware data.

**3 Hotspots.** Two different "biggest" things. Per call, model inference costs the most. By count, polling dominates. Repeated FAQ questions are the caching candidate. Stored waste is small but free to fix.

**4 Skeptic.** "Why should we believe this?" The *locations* come straight from code and config, and one real trace backs the polling story. The *sizes* are not measured, and n8n has pruned nearly all history. That is a finding in itself: today we couldn't prove an improvement even if we made one.

**5 Assumptions.** Read the confidence column. Only retention is known. Region is the biggest unknown for carbon.

**6 Pillars map.** Energy is touched by everything. Measurement is the blocker: without per-R data, carbon stays a guess.

**7 S1.** Cheapest fix, a few lines in the widget plus an `escalated` flag in the chat response. Same logic on the server: the Notion triggers drop from hourly to daily, because help pages rarely change. Say honestly that a poll is cheap, so this is mainly about quota, cost and noise.

**8 S2.** Only build it if the baseline shows repetition. The quality guard is weekly grading of cache hits, and invalidation reuses the Notion update trigger we already have.

**9 S3.** This is where energy per R actually drops. Hint from the lesson: pair any smaller model with a quality check, never a blind downgrade.

**10 S4.** Storage hygiene. The twist is that deleting logs must not destroy the evidence the measurement plan needs, so counters replace logs.

**11 S5.** Region changes I for every call. Pinecone is on us-east-1 because of the free tier, so this costs a paid plan plus a migration, and it waits for the baseline. Time-shifting barely matters here because re-embedding is rare.

**12 Measurement.** Compare per R, not per day. SCI is reported as a range with the boundary from slide 2. Success criteria and guardrails are fixed before the trial starts.

**13 Before/after.** Worst-case executions drop by about 99%. LLM calls drop by about 40%. Both are hypotheses. The metric to watch daily for one week is executions per R and input tokens per R.

**14 Caveats.** No carbon-neutral claim, no offsets presented as reductions, and polling is not the biggest energy item. Validate next: n8n region with Ironhack, OpenAI residency with the account owner, and the cost of a paid Pinecone plan for an EU region. The ask: approve the 2-week trial.

## 6. Verify checklist

- [x] One primary audience named (Vela CTO, title slide and slide 1)
- [x] Every proposed solution maps to at least one pillar (chips on slides 7–11)
- [x] No unverifiable claims ("carbon neutral", kg CO₂e). SCI methodology and boundary stated (slides 2, 12, 14)
- [x] Recommendations linked to business outcomes: cost per R, execution quota, latency, data residency, GDPR minimisation
- [x] Deck is 14 content slides plus a title slide
- [x] Stretch: before/after hypothesis slide (13) and a numeric proxy on the defense slides (360 polls, 1 of ~9 polls useful in trace #2204)
