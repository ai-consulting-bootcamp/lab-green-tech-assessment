# Lab walkthrough: Path B, retrofit audit

**Student:** Gordan
**Path followed:** B (retrofit audit of an existing artifact)
**Artifact audited:** Virtual Coffee Chat Bot by John P
`https://github.com/jp92672/johna-project3-week6-virtural-coffee-chat-bot`

This document maps each step of the lab to what I actually submitted. It is a companion to
the deck, not a replacement for it. `instructions.md` and `rubric.md` in this fork are
unmodified.

---

## Kick off

**Artifact selected.** John's Virtual Coffee Chat Bot, an n8n workflow that answers
recruiter questions about him from a Pinecone backed knowledge base and can book a call or
send an email. I audited the same repo for the GDPR lab in Week 6, so I already knew the
architecture and could spend this lab on the carbon story rather than on orientation.

**What the system does, in 50 words.** A recruiter opens a chat widget and asks a question.
An n8n RAG agent embeds the question, retrieves matching chunks from Pinecone, reranks
them, and answers as John. If the recruiter wants to talk, the agent can offer Calendly
slots or send an email via Resend.

**Functional unit R.** One answered question in the chat.

I considered and rejected two alternatives. "One conversation" varies too much in length to
compare across users. "One booked call" is the business outcome but cannot be measured from
outside John's n8n instance, and most sessions never reach it. One answered question is the
smallest repeatable unit that every session produces at least one of.

---

## Recognize: where compute concentrates

Read from the committed workflow JSON, not guessed:

- Rule 1 of the agent system prompt forces a Pinecone tool call before any answer, so every
  answered question costs **two model calls**, not one.
- The system prompt is 869 words, 5,502 characters, roughly 1,376 tokens, and it is sent on
  both calls.
- `Retrieve from Pinecone` uses `topK: 20` with a Cohere reranker. Twenty chunks are
  embedded into the second call regardless of how narrow the question was.
- `Chat Memory for Recall` has `contextWindowLength: 8`, so eight prior turns ride along on
  both calls.
- The ingestion workflow sends `{"deleteAll": true}` and re embeds the entire knowledge base
  on every run, whether or not the source files changed.

Repeated work is concentrated in two places: the same recruiter questions being answered
from scratch every time, and the same unchanged documents being re embedded every run.

---

## Apply: the numbers

Per answered question, estimated by arithmetic on committed configuration:

| Component | Tokens in |
|---|---|
| Retrieved chunks (topK 20) | 3,750 |
| System prompt, sent twice | 2,752 |
| Memory window, sent twice | 2,400 |
| The recruiter's actual question | 30 |
| **Total** | **~9,250** |

The user's question is roughly 0.3 percent of what the model reads.

**What is measured versus estimated.** Prompt length, model choice, topK, chunk sizes,
memory window and the deleteAll behaviour are all read directly from the repo. Token counts
per chunk and the two call structure are arithmetic on top of that. Nothing here comes from
runtime logs, because `chat_log` lives inside John's n8n instance and is not in the
repository. The deck states this on slides 5, 12 and 14.

**One correction I made mid audit.** I initially assumed chat history grew without limit.
`contextWindowLength: 8` disproved it. I dropped the finding rather than keeping a claim
that read well.

---

## Integrate: four proposed improvements

Each is on its own slide in the deck with problem, change and pillars.

1. **Move conditional prompt rules into tool descriptions.** Rules 12 to 16 and 18 to 19
   cover contact, calendar and email handling, roughly 660 tokens, and are sent on every
   call including the ones that never touch a tool. Move them into the Calendly and Resend
   tool descriptions so they load only when the tool is considered. Rules 7 to 10, the anti
   prompt injection block, stay where they are. Pillars: energy, carbon.

2. **Cache repeated recruiter questions.** Stated as a hypothesis, not a finding, because
   the chat log needed to size it was inaccessible. Includes a measurement plan to confirm
   the repeat rate before building anything. Pillars: energy, carbon, measurement.
   Pattern: [Cache static data](https://patterns.greensoftware.foundation/catalog/cloud/cache-static-data/).

3. **Reduce topK from 20 to 8,** paired with a fifteen question quality check rather than a
   blind downgrade. Roughly 2,250 fewer context tokens per question if answer quality holds.
   Pillars: energy, carbon.

4. **Replace the deleteAll re embed with change detection.** Hash source files and re embed
   only what changed. Pillars: energy, hardware, measurement.

**On pattern citations.** Only improvement 2 has an honest match in the catalog. The deck
says so explicitly rather than forcing four citations onto four fixes. The lab instructions
say to name a pattern only if it genuinely fits.

---

## Measurement plan

Tracked for one to two weeks, all per R:

- Input tokens per answered question
- Model calls per answered question
- Cache hit rate, once a cache exists
- Answer quality on the fifteen question check set, before and after the topK change
- Embedding operations per ingestion run

Success threshold: input tokens per answered question fall below 6,000 with no drop on the
quality check set.

---

## Caveats

No carbon figure is claimed, because none can be verified from outside the instance. No
offset framing. Every number in the deck is arithmetic on committed configuration and is
labelled as such. The next validation step is asking John to export a window of `chat_log`
so the repeat rate behind improvement 2 can be confirmed or killed.

**Before and after hypothesis:** roughly 9,250 input tokens per answered question down to
roughly 5,700, about 38 percent, if all four changes land and quality holds.

---

## Checklist

- [x] One primary audience named: John, as the person who would implement the changes
- [x] Every proposed solution maps to at least one pillar
- [x] No unverifiable carbon neutral claims
- [x] Recommendations tied to cost and latency, not only to emissions
- [x] 14 content slides plus a title slide
- [x] Deck committed as `.pptx` and `.pdf`
- [x] `README.md` maps every committed file
- [x] Repository scoped to this lab only
- [x] Audit template committed as a separate `.md` file
