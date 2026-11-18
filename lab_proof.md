# Lab Proof: Defend your stack's carbon story

**Author:** Elif Yurdakul · **Path:** **B – Green retrofit audit** of my Project 3
**Artefact audited:** Unioptt Programme Research Agent · [github.com/SelfUpdateWorks/Project-3---Unioptt](https://github.com/SelfUpdateWorks/Project-3---Unioptt)
**Audience:** Unioptt's head of product / CTO

## Deliverables
| File | Contents |
|---|---|
| [green_retrofit_audit_unioptt_research_agent.pptx](green_retrofit_audit_unioptt_research_agent.pptx) | The deck: 13 content slides + title, speaker notes on every slide |
| [green_retrofit_audit_unioptt_research_agent.pdf](green_retrofit_audit_unioptt_research_agent.pdf) | PDF export of the same deck |
| `lab_proof.md` | This file: audit template, unit of value, checklist, limitation |
| `README.md` | File map |

---

## Kick-off (Path B): what the system does (50 words)
The agent takes one university programme, finds its official web pages, and has an AI model (gpt-4o-mini) extract key facts such as tuition, deadlines and requirements, each with a quote. Python checks every fact, searches again for missing ones, adds country rules, and writes a sourced due-diligence report.

**One unit of value (R):** one Programme Due Diligence Report in which every key fact has a final status and a source.

---

## Retrofit audit template

**Artifact:** Unioptt Programme Research Agent (Project 3), repo above.

**Primary user journey:** a student picks a programme → the agent researches official pages → the student gets a report with verified facts, total cost in EUR and TRY, readiness gaps and next steps.

**Hotspots (compute / data movement):**
- AI extraction on every page: up to 60,000 characters (~15,000 tokens) per page, several pages per report
- The same, mostly unchanged pages are fetched and extracted again on every run
- The search loop (up to 4 rounds) asks the model for all 9 facts again, not only the missing ones
- The planned weekly catalogue refresh (94 programmes) would multiply all of the above
- Reports, vectors and logs are kept indefinitely

**Green opportunities (prioritised):**
1. **Quick win:** page cache with a content fingerprint: unchanged page → reuse extracted facts, no model call · *Pillar: energy* · *Pattern: Cache static data*
2. **Quick win:** send the model only the relevant sections of a page (and strip names/emails) · *Pillar: energy, less data movement*
3. **Medium:** ask only for missing facts in later loop rounds; stop when nothing new is found · *Pillar: energy*
4. **Strategic:** batch the catalogue refresh at green hours, use EU regions where available, set retention · *Pillar: carbon awareness + hardware (storage)*

**What I would measure to prove improvement:** tokens per R, model calls per R, pages fetched and cache hit rate per R, cost per R, and **facts Verified per R** (quality must not drop). Week 1 baseline on 10 programmes, week 2 after fixes 1–3.

**Risks / trade-offs:** a cached fact can go stale (mitigated by the fingerprint check and expiry each application cycle); trimming pages or asking for fewer facts can lower the number of Verified facts (tested on the sample programmes before switching); EU regions are not offered by every vendor.

---

## Verify checklist
- [x] One primary audience named (head of product / CTO, slide 1)
- [x] Every proposed solution maps to at least one pillar (footer on each solution slide)
- [x] No unverifiable claims ("carbon neutral"); caveats slide; offsets excluded from SCI
- [x] Recommendations linked to business outcomes (cost, latency, GDPR risk), not only "planet"
- [x] 13 content slides + title (within 8–14)
- [x] Stretch: before/after hypothesis slide (slide 12)

---

## Lab evidence
- **Input:** my Project 3 artefact: code structure (`src/extract.py` page limit `MAX_PAGE_CHARS = 60_000`, loop of up to 4 rounds in `src/graph.py`), the two sample runs (Groningen, TUM), and the README.
- **Evidence:** hotspot and assumption tables (slides 3–4), pillars map (slide 5).
- **Final output:** the deck, with four GSF-aligned improvements and a two-week measurement plan.
- **Failure or limitation:** I never logged tokens, pages or model calls per run in Project 3, so every number except the page limit, loop limit and run-to-run variation is an estimate. The token and cost figures on slides 4 and 12 are guesses to be replaced by week 1 of the measurement plan; the vendors do not publish energy per call, so tokens and cost remain proxies.
