---
type: minor
areas:
  - ai-shopping-assistant
  - tooling
---

## Intent

Prepare the AI shopping assistant by adding its feature module and a deterministic `ShoppingIntent` model that validates and normalizes untrusted search intent before it can reach Vendure.

## Invariants

- `ShoppingIntent` describes search criteria only and never names concrete products; Vendure remains the source of truth for products, prices, and availability.
- Prices in a `ShoppingIntent` are integer minor units of the active currency, including tax, matching Vendure `priceWithTax`.
- `src/features/ai-shopping-assistant/intent.ts` has no runtime imports, so it stays pure and testable in isolation.
- Sort preferences only use fields exposed by the Shop API's `SearchResultSortParameter`.

## Integration guidance

Register the `ai-shopping-assistant` feature in `eslint.config.mjs` and `.upgrades/areas.json`. Keep `intent.ts` free of runtime imports, or update its test, which transpiles the module in isolation. Extend the sort fields only with fields your Shop API's `SearchResultSortParameter` exposes.

## Verification

- Run `npm test` and confirm the `ShoppingIntent` tests pass.
- Run `npm run lint`, `npm run check-types`, `npm run upgrade:validate`, and `npm run build`.
