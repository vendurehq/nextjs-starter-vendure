---
type: minor
areas:
  - ai-shopping-assistant
  - tooling
---

## Intent

Connect a validated `ShoppingIntent` to the Vendure catalog through a server-side `searchCatalog` service that returns a small list of grounded `ProductCandidate` objects for the AI shopping assistant.

## Invariants

- Every candidate, variant, price, and option comes from Vendure Shop API responses; nothing is inferred or generated.
- Product discovery reuses the storefront's `SearchProductsQuery`; the assistant does not introduce a separate search architecture.
- Each request performs at most one bounded search and one batched product query, and never reads the whole catalog.
- Criteria Vendure search cannot apply, such as price bounds and option attributes, are enforced only against returned Vendure data. Attributes that the catalog data does not describe are reported as unverified, not enforced or claimed.
- Vendure failures yield an `error` status instead of throwing to the caller.

## Integration guidance

Keep `catalog-filter.ts` free of runtime imports so its tests can transpile it in isolation. If your Shop API supports native price-range filtering, such as through the Elasticsearch plugin, map the intent's price bounds into the search input and keep the server-side check as a safeguard. Model attributes customers ask for as Vendure facets or product options so they can be verified.

## Verification

- Run `npm test` and confirm the catalog filter tests pass.
- Run `npm run lint`, `npm run check-types`, `npm run upgrade:validate`, and `npm run build`.
