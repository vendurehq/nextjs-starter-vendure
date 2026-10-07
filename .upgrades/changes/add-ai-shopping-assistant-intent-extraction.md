---
type: minor
areas:
  - ai-shopping-assistant
  - tooling
---

## Intent

Let the AI shopping assistant turn a natural-language request into a `ShoppingIntent` with an OpenRouter language model, then answer it with grounded Vendure products through `searchCatalog`. The model only extracts search criteria; it never supplies products.

## Invariants

- Model output is untrusted: it must parse as JSON, match the intent schema, use only existing collection slugs, and pass `parseShoppingIntent` before any catalog query runs.
- Products, prices, and attributes in results come only from Vendure.
- `OPENROUTER_API_KEY` is read only by `src/features/ai-shopping-assistant/openrouter.ts`, is never logged, and must not be reachable from client modules; architecture tests enforce this.
- Prices stated in a currency other than the active storefront currency are reported and dropped, never converted.
- Provider failures, timeouts, and invalid output yield an `unavailable` result instead of throwing.

## Integration guidance

Set `OPENROUTER_API_KEY` in the server environment, and optionally `OPENROUTER_MODEL` to a model that supports structured outputs. Never add a `NEXT_PUBLIC_` variant. To change providers, implement `StructuredCompletionProvider` from `intent-extraction.ts` in a server-only module and import it in `assistant.ts` instead of the OpenRouter provider; keep the schema, validation, and currency handling unchanged.

## Verification

- Run `npm test` and confirm the intent extraction, OpenRouter, and architecture boundary tests pass.
- Run `npm run lint`, `npm run check-types`, `npm run upgrade:validate`, and `npm run build`.
