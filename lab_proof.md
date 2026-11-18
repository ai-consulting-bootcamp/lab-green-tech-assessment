# Lab | Defend your stack carbon story

## Kleindeutschland — green-tech assessment (Path A)

**Audience:** COO — owns operating cost and customer service quality  
**Date:** 18 November 2026  
**Assessment status:** directional draft; replace placeholders with observed data

---

## Title slide — The greenest flashcard feature is the one that shares the existing runtime

Kleindeutschland turns incomplete German Telegram queries into a structured word entry, meaning, expression, and source, then writes the result to Airtable. A planned flashcard bot will read those entries and support review.

The main sustainability lever is operational: avoid a second always-on host and avoid repeated model calls. This also reduces cost and can improve response time.

---

## 1. Hook — three levers worth testing

More than ten queries a day can make an always-on runtime the dominant footprint, even when each individual AI call is small.

| Lever | Current assumption (honest guess) | Better alternative to explore |
| --- | --- | --- |
| Call pattern | Every query reaches the model; duplicates are checked after the call | Normalize and check Airtable before the model; cache reusable output |
| Model / size | Current parse model is `gpt-4o-mini`; prompt uses about 607 input and 53 output tokens per R | Keep a standard model, cap output, and test quality before changing model |
| Infra / region / retention | A small host runs continuously; region and shared workload are unknown | Put the flashcard bot in the existing n8n runtime; measure host power and choose a cleaner region where practical |

**Use case:** Telegram → n8n parsing → OpenAI → duplicate check → Airtable → Telegram reply, plus a planned flashcard workflow.  
**Business stakes:** hosting cost, API cost, latency, reliability, and a defensible sustainability claim.

---

## 2. One unit of value

**R is one saved vocabulary entry or one reviewed flashcard.**

This keeps the built pipeline and the planned flashcard bot comparable. Totals are useful for planning, but the decision metric is energy and carbon per R.

**Boundary:** Telegram, n8n, the OpenAI call, duplicate check, Airtable read/write, and Telegram response. Excluded: model training, personal devices, development time, network detail that cannot be quantified, shared-server embodied carbon, and hardware embodied carbon.

The assessment uses SCI-style thinking:

```latex
SCI = \frac{(E \times I) + M}{R}
```

`E` is operational energy, `I` is grid carbon intensity, `M` is embodied carbon, and `R` is the functional unit. `M` is not estimated because the hosting hardware is shared.

---

## 3. Assessment defense — hotspots and repeated work

**Current flow:**

```text
Telegram message
  → n8n parse/edit fields
  → OpenAI call
  → duplicate check
  → Airtable write
  → Telegram reply
```

| Hotspot | Why it costs | Repeated? / caching candidate? |
| --- | --- | --- |
| Always-on n8n host | It consumes power while waiting; the estimate assigns 5 W continuously | Yes — dominant current hotspot |
| One OpenAI call per query | Use scales with every query; duplicate entries still pay for the call | Yes — check exact normalized matches first |
| Reasoning-model parsing | A short benchmark measured 3.65 Wh for an o4-mini high case versus 0.21–0.58 Wh for short standard-model prompts | Repeated per query; avoid unless quality requires it |
| Separate flashcard host | A second always-on machine would reproduce the largest current cost | Yes — share the existing runtime |
| Telegram / Airtable traffic | Adds API and network work, but is unquantified and likely small beside idle hosting | Some repeated reads/writes; measure if scale increases |

**Why believe this?** The host estimate is explicitly a placeholder. The model figures come from published independent estimates and benchmarks; n8n execution counts, tokens, provider region, and real host power are the next evidence needed.

---

## 4. Assessment defense — assumptions and estimate

| Assumption | Working value | Confidence | How to check |
| --- | --- | --- | --- |
| Saves per day | 20 | Low | Count successful n8n executions for one week |
| Card reviews per day | 30 | Low | Count Telegram review events after the bot pilot |
| Energy per standard OpenAI call | 0.3 Wh; 0.6 Wh high case | Low–medium | Log model, tokens, and compare with current benchmark ranges |
| Attributed hosting power | 5 W; 10 W high case | Low | Measure the host or obtain a provider report |
| Grid intensity | 330 g CO2e/kWh, Germany annual average proxy | Medium for proxy, low for actual region | Confirm provider region and use provider/hourly data |

The draft estimate is about **15 kg CO2e/year** for the built pipeline at the placeholder volume. A 10 W host and 0.6 Wh calls produce roughly **30 kg/year**. These are order-of-magnitude figures, not measured emissions.

---

## 5. Pillars map — where the assessment points

| Hotspot / decision | Energy | Carbon | Hardware | Measurement |
| --- | --- | --- | --- | --- |
| 5 W always-on host | Idle power dominates | About 95% of the estimated 15 kg/year | Avoid a second server; use existing hardware | Measure real watts and uptime |
| OpenAI call per query | Scales with calls and tokens | About 0.3 Wh/call at the working estimate | Model choice affects compute demand | Log calls, model, input/output tokens |
| Reasoning model | High-case energy can be 6–18× standard cases | Could add about 8 kg/year in the working scenario | More capable compute is not automatically greener | Quality-check a standard model against the task |
| Flashcard review design | Reads/writes are small; an extra runtime is not | A separate host could add a comparable footprint | Share the n8n instance | Track reviews per R and host attribution |

---

## 6. Proposed solution 1 — share the existing n8n runtime

**Problem:** A separate always-on flashcard server would duplicate the idle hosting line.

**Change:** Build the flashcard bot as workflows in the existing n8n instance: Telegram trigger, scheduled daily push, Airtable reads/writes, and review response.

**Expected effect:** Avoid about **14.5 kg CO2e/year** versus a separate 5 W server under the draft assumptions.

**Pillars:** energy, carbon, hardware, measurement.  
**Business outcome:** lower infrastructure cost and fewer services to operate.  
**Effort:** low.  
**Pattern fit:** share existing capacity; validate that added workload does not require scaling the host.

---

## 7. Proposed solution 2 — generate examples once, not at review time

**Problem:** Generating an example sentence during every card review repeats model work and makes review dependent on an API call.

**Change:** Generate the example once during the existing parse call, store it in Airtable, and reuse it during reviews. If it is optional, omit it rather than generating it live.

**Expected effect:** Avoid about **1.1 kg CO2e/year** at the draft review volume and remove latency from each review.

**Pillars:** energy, carbon, measurement.  
**Business outcome:** faster, more reliable reviews and lower API cost.  
**Effort:** low.  
**Pattern fit:** cache reusable results; measure cache-hit rate and quality complaints.

---

## 8. Proposed solution 3 — prevent duplicate model calls

**Problem:** The current order parses with OpenAI before checking Airtable, so a duplicate entry still incurs the model call.

**Change:** Lowercase and trim the incoming word or normalized key, check Airtable for an exact match, and skip the model call on a hit. Keep a fallback for ambiguous matches.

**Expected effect:** About **0.14 kg CO2e/year** saved at an assumed 20% duplicate rate and 20 saves/day; the real saving depends on duplicate frequency.

**Pillars:** energy, carbon, measurement.  
**Business outcome:** faster duplicate responses and fewer paid API calls.  
**Effort:** low to medium.  
**Pattern fit:** caching / avoid repeated work; validate that normalization does not merge distinct entries.

---

## 9. Proposed solution 4 — right-size the model and prompt

**Problem:** A reasoning model or unnecessarily long output can multiply energy per query. Smaller is not automatically cheaper, so a blind downgrade risks quality.

**Change:** Keep a standard non-reasoning model, short prompt, structured JSON response, and maximum output-token cap. Run a sample quality evaluation before changing model or limits.

**Expected effect:** Guards against roughly **8 kg CO2e/year** in the reasoning-model high case; actual effect must be calculated from measured tokens and model use.

**Pillars:** energy, carbon, measurement.  
**Business outcome:** lower token cost and predictable latency without sacrificing useful definitions or sources.  
**Effort:** low.  
**Pattern fit:** right-size demand; quality is a release criterion.

---

## 10. Proposed solution 5 — choose and measure infrastructure deliberately

**Problem:** The actual host region and power draw are unknown. A separate host in a carbon-intensive region could erase gains elsewhere.

**Change:** First run on hardware already powered or the existing n8n host. If moving providers, compare regional carbon intensity and retention requirements; measure watts, uptime, and shared workload.

**Expected effect:** A region near 3 g CO2e/kWh rather than roughly 276–330 g/kWh could cut the hosting line by well over 90%, subject to provider accounting and availability.

**Pillars:** carbon, energy, hardware, measurement.  
**Business outcome:** lower infrastructure risk and a better-supported sustainability narrative.  
**Effort:** medium.  
**Caveat:** provider market-based renewable claims are not interchangeable with location-based grid intensity.

---

## 11. Measurement plan — two weeks to replace guesses

| Metric, per R where possible | Week 1 baseline | Week 2 target | Source |
| --- | --- | --- | --- |
| OpenAI calls per saved entry | Measure current flow | At least 20% lower if duplicates occur | n8n execution logs |
| Input and output tokens per saved entry | Current known sample: 607 input / 53 output | At least 15% lower without quality loss | OpenAI response metadata |
| Duplicate-call rate | Measure normalized duplicates | 0 model calls for exact matches | Airtable + n8n logs |
| Example generations per reviewed card | Measure current design | 0 live generations; stored examples reused | n8n logs |
| Host watts × uptime | Unknown | Record actual watts and shared workload | Power meter or provider report |
| Reviews and saves per day | Working guesses: 30 / 20 | Replace guesses with observed counts | Telegram / Airtable / n8n |
| Quality pass rate | Define a sample rubric | No material drop in correct fields/examples | 50-item human sample |

Report **energy and carbon per R**, not only total emissions. Use the measured host allocation plus model-call proxy to recalculate SCI-style results.

---

## 12. Caveats and what must be validated

- The 5 W host and 10 W high case are approximations, not measurements.
- The 0.3 Wh call estimate and 0.6 Wh high case come from independent estimates and benchmarks, not from this account’s calls.
- The model benchmark spans roughly 0.21–0.58 Wh for short prompts; model size alone does not prove lower energy.
- The 330 g CO2e/kWh figure is a Germany annual-average proxy. The actual data-center region, hourly intensity, and provider accounting are unknown.
- Telegram, Airtable, network energy, water use, model training, and embodied hardware carbon are not quantified.
- No “carbon neutral” claim is justified. Offsets would not replace measuring operational SCI-style impact.

**Client questions before publishing a total:** Where does n8n run? Does the host run other workloads? Which model and token counts are real? What are actual saves/reviews? Should example generation exist at all?

---

## 13. Before/after hypothesis

**If** the flashcard bot shares the existing n8n host, exact duplicates are checked before OpenAI, examples are generated once, and parsing stays on a capped standard model, **then** we expect:

- no second always-on hosting line;
- at least 20% fewer model calls if the 20% duplicate assumption is observed;
- zero live model calls during ordinary card review;
- lower tokens per saved entry without a material quality drop; and
- a reduction from the draft’s roughly 15 kg CO2e/year baseline, with the final percentage determined by measured host power, model use, and traffic.

**Decision rule after two weeks:** keep the changes that reduce energy or calls per R while preserving the quality pass rate and acceptable latency. Revisit the architecture if shared n8n capacity becomes a reliability bottleneck.

---

## Sources

- [Epoch AI — How much energy does ChatGPT use?](https://epoch.ai/blog/how-much-energy-does-chatgpt-use)
- [Jegham et al. — How Hungry is AI?](https://arxiv.org/pdf/2505.09598v5)
- [Electricity Maps — Germany grid review](https://www.electricitymaps.com/year-review)
- [Green Software Foundation — SCI and ISO/IEC 21031:2024](https://greensoftware.foundation/articles/built-to-measure-sci-impact-framework-and-carmen/)
- [Cherry Servers — n8n self-hosting requirements](https://www.cherryservers.com/blog/n8n-self-hosting-requirements)
- [GreenCalculus — Google Cloud region carbon intensity](https://greencalculus.com/data/google-cloud-region-carbon-intensity/)
