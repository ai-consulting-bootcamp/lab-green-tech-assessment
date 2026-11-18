# Defend your stack's carbon story

## Path B — Green retrofit audit

**Artifact:** [VC Screening Agent project README](https://github.com/Sobregonm/project3-vc-screening#readme)

The VC Screening Agent takes a startup name and website. It collects public information and uses GPT-4o mini to find evidence about location and funding stage. Python checks the quotes and applies the fund's rules. The agent saves a Markdown report with sources and marks unconfirmed criteria as “Not verified”.

**Unit of value (R):** One screening report generated for one startup.

**Audit scope:** From the startup name and website entered by the user to the saved Markdown report.

## Points to check

| Workflow step | What to check per report |
| --- | --- |
| Tavily, Jina Reader, and GDELT | Which services were called and whether any call was repeated. |
| Search loop | Whether the workflow searched for more evidence and what started the extra search. |
| GPT-4o mini | How many model calls were made and how many input and output tokens were used. |

## Run evidence — Kalipso

### Main run — GDELT rate limit

**Input:** Kalipso, https://kalipso.ai/

**Command:** `python main.py "Kalipso" "https://kalipso.ai/"`

**Terminal evidence:**

```text
Tavily found 5 source(s).
Jina read 14092 characters from https://kalipso.ai/
GDELT rate limit. Retrying in 10 seconds.
News search failed: GDELT returned HTTP 429.
```

**Failure and response:** The workflow waited 10 seconds and retried GDELT once. The news search still failed. The workflow used the available sources and saved the report.

**Final output:** [Kalipso screening report — HTTP 429 run](evidence/kalipso-screening.md)

- **Geography — Meets.** The report cites three sources that place Kalipso in Barcelona, Spain.
- **Funding stage — Not verified.** Some funding claims could not be matched to the source text.
- **Recent news — Not verified.** The report records the GDELT HTTP 429 error.

### Additional run — GDELT returned a result

With the same command and input, Tavily found five sources and Jina Reader read 14,092 characters. GDELT returned one result from Chronicle.lu. The terminal showed no retry and confirmed that the report was saved to the same path. The funding stage stayed `Not verified`. The relevance of the Chronicle.lu result and its inclusion in the second report remain unverified.

**Third run — Retry returned a result.** With the same Kalipso input,
GDELT reached its request limit. The workflow logged a 10-second wait
before the retry. The retry returned one search result from Chronicle.lu,
and the workflow saved the report. We have not checked whether the
result was relevant to Kalipso.

## Measurement limits

- The logs show one GDELT retry in the main run. The logs do not show whether the agent started a new search round for missing evidence.
- Jina Reader read 14,092 characters per report in these two runs. This measures text retrieved by Jina Reader.
- The amount of text sent to the model, the model calls and tokens per report, and the energy used remain unknown.

## Audit findings

| Area | What we found | What to measure next |
| --- | --- | --- |
| GDELT retry | In one run, the agent waited 10 seconds, sent one extra request, and still got HTTP 429. It saved the report with the other sources. | Count retries per report and record how much time they add. |
| Web text | Jina Reader retrieved 14,092 characters from the official website in each run. | Measure how much text the agent sends to the model per report. |
| Model use | GPT-4o mini extracts evidence, but the logs do not show its calls or token use. | Count model calls and input and output tokens per report. |

**Why should we believe this?** The terminal log shows the retry, and the
saved report records the HTTP 429 error. The two runs show what happened
in these cases. Energy use and carbon emissions remain unknown.

## Prioritized improvements

| Priority | Proposed change | Green Software pillar | How to check the result |
| --- | --- | --- | --- |
| 1 — Quick win | Log API calls, retries, model calls, input and output tokens, and total time for each report. | Measurement | Check that each report has a complete record, including runs where an API fails. |
| 2 — Quick win | Test a time limit for the news search. Use the retry time from GDELT if it is available and fits within that limit. If the search cannot finish in time, save the report with the other sources. | Energy | Compare retries and time per report. Check whether fewer reports include useful news. |
| 3 — Medium | Remove repeated text and send the most relevant source sections to the model. Keep source links and enough text to check each quote. | Energy | Compare input tokens per report. Check that the agent can still verify the same claims against the sources. |
| 4 — Strategic | Keep the workflow on demand. If the team later adds scheduled runs, test running flexible jobs during lower-carbon hours where the team controls the compute and has local grid data. | Hardware, Carbon | Check whether the workflow needs any dedicated server running between jobs. For scheduled jobs, compare local grid carbon intensity and check that reports still arrive on time. |

## Measurement plan

**Unit of value (R):** One screening report generated for one startup.

**Week 1 — Baseline.** Run the current workflow for a small set of
startups, including Kalipso. For each run, record API calls by service,
GDELT retries and results, model calls, input and output tokens, total run
time, and whether the report was saved. Keep records of failed runs too.

**Week 2 — Comparison.** Use the same startup names, websites, and fund
rules. Test one change at a time. Use the same saved source text to test
shorter model inputs. Record live GDELT results separately because they
can change between runs.

| Improvement | Measure | Success criterion |
| --- | --- | --- |
| Add logging | Share of runs with a complete record | Every test run has a record, including runs where an API fails or no report is saved. |
| Limit news search time | GDELT requests, retry wait time, and useful news results | Less retry wait time in rate-limit tests. The report still saves and clearly marks missing news. Check whether the change also reduces useful news results. |
| Reduce model input | Input tokens per report and quality of source checks | Fewer input tokens on the same source text. The same supported claims pass the checks, and claims without enough evidence stay `Not verified`. |
| Keep runs on demand | Dedicated server idle time and, if scheduling is tested, grid carbon intensity | The workflow needs no dedicated server between runs. If scheduling is tested, flexible jobs run in lower-carbon hours and reports still arrive on time. |

**Measurement limits.** Calls, tokens, and time show how much work the
agent does. Energy use and carbon emissions remain unknown. The carbon
test needs local grid data and control over when the jobs run.

## Retrofit audit template

- **Artifact:** [VC Screening Agent README](https://github.com/Sobregonm/project3-vc-screening#readme).
- **Primary user journey:** An analyst enters a startup name and website. The agent gathers evidence and saves a Markdown screening report.
- **Hotspots:** GDELT retries, text retrieved from the web, and model calls for evidence extraction.
- **Green opportunities, in priority order:** 1. Log activity per report. 2. Test a time limit for news search. 3. Send less text to the model. 4. Keep the agent on demand and explore lower-carbon hours if scheduled runs are added.
- **What to measure:** API calls, retry wait time, model calls, tokens, and total time per report. Check that the report still keeps the evidence analysts need.
- **Risks and tradeoffs:** A shorter wait may miss useful news. Shorter inputs may remove text needed to check quotes. A carbon estimate needs energy, grid, and hardware data.

## Submission files

- **Audit deck:** [VC Screening Agent green audit](SO_green-audit-vc-screening.pptx)

- **Workflow diagram:** [VC Screening Agent workflow](flujo.png)

- **Workflow code:** [VC Screening Agent source code used for the Kalipso run](https://github.com/Sobregonm/project3-vc-screening/blob/main/main.py)
