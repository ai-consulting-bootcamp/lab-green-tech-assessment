# Lever Table

| Lever | Current assumption | Better alternative |
|---|---|---|
| Model / size | GPT-4o-mini, no caching | Cache document embeddings by hash |
| Call pattern | Synchronous, retries from top | Idempotency check before API retry |
| Infra / region / retention | EU-hosted, 90-day retention, sync wait | Async webhook pattern, review retention need |

Referenced on slide 13 of the deck.
