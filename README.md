# LAB | Defend your stack's carbon story (Path B: green retrofit audit)

A green-software audit of my Project 3 **Vendor Due-Diligence Agent** ([repo](https://github.com/PietFALB/vendor-dd-agent)), with a slide deck that defends the assessment and proposes four improvements mapped to the GSF pillars (carbon, energy, hardware, measurement).

**Start here:** [`lab_proof.md`](lab_proof.md)

## Files

| File | What it is |
|---|---|
| [`lab_proof.md`](lab_proof.md) | Entry point for the reviewer: workflow, one run with its input, evidence, final output and limitations |
| [`deck/carbon_story_vendor_dd_agent_path_b.pptx`](deck/carbon_story_vendor_dd_agent_path_b.pptx) | The slide deck (13 content slides + title), with speaker notes |
| [`deck/carbon_story_vendor_dd_agent_path_b.pdf`](deck/carbon_story_vendor_dd_agent_path_b.pdf) | PDF export of the deck |
| [`retrofit_audit.md`](retrofit_audit.md) | Filled-in Path B retrofit audit template: hotspots, assumptions, prioritized opportunities, measurement plan, risks |
| [`images/langsmith_overview_7days.png`](images/langsmith_overview_7days.png) | LangSmith overview (7 days): trace count, latency, cost, model calls and tool calls |
| [`source/build_deck.js`](source/build_deck.js) | Script that generates the deck (pptxgenjs) |
| [`instructions.md`](instructions.md) | Lab instructions from Ironhack (came with the forked lab repository, unchanged) |
| [`rubric.md`](rubric.md) | Lab grading rubric from Ironhack (came with the forked lab repository, unchanged) |

## Deck outline

1. Hook: every vendor check has a footprint
2. One unit of value (R) and the system boundary
3. Where the compute concentrates (hotspots)
4. Why should we believe this? (LangSmith evidence)
5. Assumptions and unknowns
6. Pillars map
7. Solution 1: cache what doesn't change
8. Solution 2: fewer agent steps, same model
9. Solution 3: reuse reports, batch re-screening
10. Solution 4: right region, no idle server
11. Measurement plan (two weeks)
12. Before/after hypothesis
13. Caveats: what I will not claim
