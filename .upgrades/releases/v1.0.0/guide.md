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

## harden-upgrade-protocol

Type: patch · Areas: account, authentication, cart, checkout, collections, orders, products, search, platform.i18n, site, tooling

## Intent

Harden provenance, release authoring, change-note validation, verification fingerprints, locale registration, and architecture boundaries after an adversarial review of the initial managed-upgrade protocol.

## Invariants

- Managed upgrades retain exact, inspectable baseline and target commits.
- Release preparation never consumes uncommitted notes or begins from an invalid configuration.
- Next.js app files remain explicit re-export shims with substantial behavior owned by feature, platform, or site modules.
- Feature-internal components remain under their owning feature's private component directory.
- Feature routes keep their current metadata and route behavior while depending only on lower-level shared modules.
- English and German message files remain complete and registered under the correct locale.

## Integration guidance

Preserve downstream configuration modules and feature boundaries. If a recorded upstream tag has moved, verify the incident before using the explicit moved-baseline acknowledgement documented in `docs/upgrades.md`. Existing release directories must use stable `vMAJOR.MINOR.PATCH` names.

## Verification

- Run the upgrade protocol, validation, i18n, and architecture regression tests.
- Run upgrade validation, lint, Next.js type generation, and the production build.

## use-next-route-types

Type: patch · Areas: platform.next, tooling

## Intent

Use Next.js-generated route props directly instead of maintaining a duplicate repository-owned route-prop shape.

## Invariants

- Feature route implementations remain delegated from the same files under `src/app/`.
- Route params and search params retain Next.js 16's asynchronous prop contract.

## Integration guidance

Replace imports from `platform/next/route-types.ts` with `PageProps<'/route'>` or `LayoutProps<'/route'>`, using the corresponding route from the `app/` tree. Preserve downstream route parameters by reflecting them in the filesystem route rather than adding them to a generic type argument.

## Verification

- Run `npm run check-types` to regenerate route declarations and validate each route literal and parameter shape.
- Run the production build to verify the delegated route exports remain valid Next.js entries.
