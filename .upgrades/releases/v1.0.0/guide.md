# Vendure storefront v1.0.0

This is the first managed storefront baseline.

Storefronts created before this release use the best-effort legacy onboarding flow.

## managed-baseline

Type: major · Areas: account, authentication, cart, checkout, collections, currency, orders, pricing, products, search, platform.i18n, platform.next, platform.vendure, site, tooling

## Intent

Establish the source-distributed storefront architecture and the first managed upgrade baseline.

## Invariants

- Files under `src/app/` remain thin Next.js route wiring.
- Storefront behavior remains developer-owned and customizable.
- Feature, platform, and site dependencies continue to follow the documented module boundaries.
- Legacy storefronts use explicit best-effort onboarding because no trustworthy pre-v1 baseline exists.

## Integration guidance

Preserve downstream behavior while mapping customized files to their new owners:

| Previous location | Managed-baseline location |
| --- | --- |
| `src/app/[locale]/**` implementations | `src/features/*/routes/**`, with thin re-exports under `src/app/` |
| `src/components/account/**` | `src/features/account/**` |
| `src/components/commerce/**` | `src/features/orders/**`, `src/features/pricing/**`, or `src/features/products/**` |
| `src/components/layout/**` | `src/site/**` |
| `src/components/shared/**` | The owning feature, `src/site/**`, or `src/components/ui/**` |
| `src/lib/vendure/**` and `src/graphql.ts` | `src/platform/vendure/**` plus feature-owned `graphql.ts` operations |
| `src/i18n/**` and root `messages/**` | `src/platform/i18n/**` plus feature- and site-owned message files |
| `src/lib/metadata.ts` | `src/config/metadata.ts` |

When a path has downstream edits, move the customization with the behavior instead of replacing it with the upstream file.

## Verification

- Run upgrade validation, tests, lint, type checks, and the production build.
- Exercise authentication, catalog browsing, cart, checkout, account, locale, currency, and revalidation flows.
