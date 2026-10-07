---
type: minor
areas:
  - ai-shopping-assistant
  - products
  - site
  - platform.vendure
  - tooling
---

## Intent

Add an opt-in AI shopping assistant section to the home page, between the hero and featured products, where shoppers describe what they need and see matching Vendure products rendered with the existing `ProductCard`. The section renders only when `OPENROUTER_API_KEY` is configured.

## Invariants

- Without a configured `OPENROUTER_API_KEY`, the home page renders no assistant section. The check runs on the server per request and exposes neither the key nor its presence to the browser.
- Product cards show only Vendure data: `ProductCandidate` now also carries Vendure's `productAsset` and typed `currencyCode`, and `imageUrl` remains for existing consumers.
- The browser receives a display state with Vendure product data, validated criteria, and general statuses only; provider details, reason codes, and `OPENROUTER_API_KEY` never reach it.
- The assistant is reached only through the `askShoppingAssistant` server action, which must stay a `'use server'` module; architecture tests fail if a client module can reach the OpenRouter provider.
- `ProductCard` behavior is unchanged; it is exposed to other features through `src/features/products/product-card.ts`.
- The in-memory rate limiter is a per-process MVP safeguard and is not sufficient for distributed or serverless deployments.

## Integration guidance

Render `ShoppingAssistantSection` from `@/features/ai-shopping-assistant/shopping-assistant-section` wherever your storefront composes the home page, rather than the client `ShoppingAssistant` directly, so the assistant stays opt-in; architecture tests enforce this. Register `aiShoppingAssistantMessageLoaders` in `src/site/i18n/messages.ts`. Replace `createRateLimiter` in `actions.ts` with a shared limiter, for example one backed by Redis, before running multiple server instances. If you customized `ProductCard`, keep accepting the `ProductCard` fragment, which the assistant builds with `maskFragments` from `@/platform/vendure/graphql`.

## Verification

- Run `npm test` and confirm the assistant view, rate limiter, catalog filter, and architecture boundary tests pass.
- Run `npm run lint`, `npm run check-types`, `npm run upgrade:validate`, and `npm run build`.
- On the home page, search for a product with the assistant and confirm the results, zero-results, and unavailable states.
- Start the storefront without `OPENROUTER_API_KEY` and confirm the home page shows no assistant section.
