# Retrofit audit template (Path B) · Editorial Research Agent

**Artifact:** Project 3, Editorial Research Agent for independent bookshops. Repo `jaimegmarquerie-ui/proyecto3-agente-editorial`, commit `3939562` (README, `editorial_agent/graph.py`, `evidence/`).

**Primary user journey:**
1. The bookseller enters a profile and an author query.
2. Search (Tavily).
3. Editions (Open Library, then Google Books).
4. Publisher pages (Tavily).
5. Gemini describes the books (3 per call) and judges them (1 call).
6. If the results are insufficient, Gemini reformulates and the chain reruns once.
7. Output: Markdown dossier + JSON evidence file.

**Unit of value (R):** one verified dossier for one author (dossier written, books judged, no tool error).

**Hotspots (compute / data movement):**
- About 4 external calls per book reviewed: ~20 calls for 5 books, 33–41 for 9–10 books.
- No cache. The same author was researched in all 20 runs, and identical source lists came back up to 4 times.
- A 2nd attempt reruns the whole chain (~41 calls instead of ~20).
- The model fails after the data has been fetched (4 × HTTP 503), and the fetched data is discarded.
- About 7,000 characters of web text, plus up to 4,000 characters per publisher page, are sent to Gemini on each run.
- Evidence and sample dossiers are kept forever and published on GitHub.

**Green opportunities (prioritized):**
1. **Quick win:** cache per ISBN and per author for 30 days. *Pillar: energy.*
2. **Quick win:** retry only what failed; on a 2nd attempt, fetch only new books; keep the data when the model fails. *Pillar: energy. Pattern: "Optimize agent orchestration to reduce unnecessary model calls".*
3. **Medium:** profile exclusions and a fixed language rule in code before any Gemini call; test a smaller model on 10 saved runs before switching. *Pillar: energy.*
4. **Strategic:** a paid EU endpoint in a low-carbon-grid region; 30-day retention; store URLs, not full text. *Pillars: carbon awareness + hardware (storage).*

**What I would measure to prove improvement (2 weeks):**
- External calls per R.
- Tokens per R (Gemini usage metadata).
- Latency per R.
- Cache hit rate.
- Share of runs without an R.
- Dossier quality on 10 saved cases (manual review).

**Risks / trade-offs:**
- A cache can serve stale data (new edition, price).
- A smaller model can lower description quality.
- A different region can add latency or cost.
- A lenient judge (91 % acceptance) makes quality hard to judge without a calibration set.
