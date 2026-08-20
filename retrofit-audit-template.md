# Retrofit audit template (Path B appendix)

**Lab:** Defend your stack's carbon story, Module 7 Week 7 Day 4
**Path:** B, green retrofit audit of an existing artifact

---

## Artifact

Virtual Coffee Chat Bot by John Adams.
Repo: https://github.com/jp92672/johna-project3-week6-virtural-coffee-chat-bot

A RAG chatbot built in n8n that answers recruiter questions about John's background and can check Calendly availability, book a call, or send an email on the user's behalf. Three workflows: ingestion, chat, error alerting. Stack is n8n, gpt-5-mini, Pinecone, Cohere rerank, Calendly, Resend.

Audited from the exported workflow JSON in `workflows/` and the repo README. No access to the running instance.

## Functional unit

**R = one answered question in the chat.**

Rejected alternatives: one conversation (length varies too much to compare between users), one booked call (truer business unit, but bookings are rare and unmeasurable from outside).

## Primary user journey

A recruiter opens the chat widget, asks a question about John's work history, and gets a grounded answer. Some conversations continue into checking availability and booking a call or sending a message.

## Hotspots

### Compute

1. **Two model calls per answered question.** Rule 1 of the system prompt forbids answering from memory and forces a knowledge base call first. The agent spends one round trip deciding to call the tool and a second producing the answer. The system prompt and the memory window are therefore paid for twice per question.
2. **System prompt: 869 words, 5,502 characters, about 1,376 tokens.** Counted directly from the `systemMessage` field. Of that, roughly 242 words are always needed and roughly 418 words are conditional (contact, calendar, email and failure-message rules).
3. **Retrieval at topK 20 with a Cohere reranker.** At chunk sizes of 500 characters (facts) and 1000 characters (narrative), roughly 190 tokens per chunk, so roughly 3,750 tokens of context on the answering call.

Estimated total: **about 9,250 input tokens per answered question**, of which the recruiter's actual question is about 30.

### Data movement

4. **Full index rebuild on any content change.** The ingestion flow sends `{"deleteAll": true}` to Pinecone, then re-reads, re-chunks and re-embeds every markdown file under `kb/`. Cost scales with the size of the whole corpus, not the size of the edit.

### Idle and repeated work

5. **No cache.** The `chat_log` Data Table records every question and answer. Nothing reads it back before calling the model, so repeated recruiter questions pay the full retrieval and generation cost every time.

## Green opportunities, prioritised

### 1. Split the system prompt (quick win)

Move rules 12 to 16 (contact, calendar, email) into the Calendly and Resend tool descriptions, and rules 18 to 19 (failure messages) into the tools they govern. The agent then loads them only when it reaches for that tool.

Saving: roughly 660 tokens per call, about 1,300 per question.
Pillars: energy, carbon.
Deliberate exception: rules 7 to 10 are the prompt injection defence, about 325 tokens. They stay. Trimming a security control to save tokens is a bad trade.

### 2. Cache repeated questions (medium)

Embed the incoming question, compare against previously answered questions, serve the stored answer above a similarity threshold. Invalidate on knowledge base rebuild.

Saving: unknown. Stated as a hypothesis because `chat_log` was not accessible.
Pillars: energy, carbon, measurement.
Pattern: **Cache static data** (GSF catalogue), https://patterns.greensoftware.foundation/catalog/cloud/cache-static-data/ — the pattern's argument for reading locally instead of fetching remotely on every request applies directly, with the model call standing in for the remote fetch.

### 3. Reduce topK from 20 to 8 (quick win)

The reranker exists to push the best chunks to the top. If the top 8 after reranking are good enough, chunks 9 to 20 are paid for and ignored.

Saving: roughly 2,250 tokens per question.
Pillars: energy, carbon.
Must be paired with a quality check: 15 representative recruiter questions at topK 20 and topK 8 side by side. Keep 8 only if no answer loses a fact.

### 4. Incremental ingestion (strategic)

Hash each source file, store the hash, skip unchanged files. Delete and re-insert only the chunks belonging to changed files, targeted by their existing `source_type` metadata.

Saving: small in money terms. The real arguments are that edit cost stops scaling with corpus size, and that `deleteAll` runs while the chat flow is live, leaving a window where the bot answers "I don't have that information".
Pillars: energy, hardware, measurement.

### Patterns not cited, and why

Improvements 1, 3 and 4 carry no pattern citation. All three reduce work per request, which is the spirit of the catalogue's data-handling patterns, but no published GSF pattern covers conditional prompt loading, retrieval-scope reduction, or incremental re-embedding. The lab brief says to name a pattern only if it genuinely fits, so these are left blank rather than forced onto the nearest title. The catalogue was restructured in v2.0 and is now browsed by lifecycle stage (Requirements, Architecture, Development, Operations).

## What I would measure to prove improvement

| Metric | Source | Success |
|---|---|---|
| Input tokens per R | OpenAI usage, per request | Down 40% or more after fixes 1 and 3 |
| Model calls per R | n8n execution log | Stays at 2; a rise means the agent is looping |
| Repeat rate of questions | `chat_log`, grouped by similarity | Establish baseline; above 30% justifies the cache |
| Answer quality | 15 fixed recruiter questions, scored by hand | No answer loses a fact it had at topK 20 |
| Cost per conversation | OpenAI, Pinecone, Cohere billing | Falls, and becomes a usable proxy for energy |

Window: two weeks. Land each change separately so its effect is attributable.

## Risks and tradeoffs

- **Prompt splitting could break booking.** The agent may behave differently when the contact rules arrive as tool descriptions rather than standing instructions. Needs a booking smoke test before it ships.
- **Lower topK could lose facts.** Hence the paired quality check. Do not downgrade blind.
- **A cache can serve stale answers.** A wrong answer about John's work history is worse than a slow one. Invalidation on rebuild is mandatory, not optional.
- **Incremental ingestion adds state.** Hashes must be stored and kept in sync, which is a new failure mode in exchange for removing a wasteful one.

## Honest limits

**Measured:** system prompt length, topK value, reranker on, memory window of 8 messages, ingestion clears the whole index.

**Estimated:** tokens per chunk, tokens per memory window, two model calls per question, knowledge base size and rebuild cost.

**Not accessible:** `chat_log` contents, real token usage from the OpenAI dashboard, whether n8n trims reranked chunks before passing them to the agent, host region and its grid intensity.

**Not claimed:** no SCI value in gCO2e, no carbon neutral claim, no offset accounting. SCI = ((E x I) + M) per R, and I have neither E, I, nor M. What this audit reports is compute per R, which is the part a change to this system can actually move.

**Correction made during the audit:** I initially assumed conversation history grew without limit on every turn, which would have made input tokens grow with roughly the square of conversation length. The `contextWindowLength: 8` setting in the memory node disproved it. The claim was dropped rather than kept for drama.
