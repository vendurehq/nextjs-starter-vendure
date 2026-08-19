---
type: patch
areas:
  - products
  - site
  - tooling
---

## Intent

Improve storefront paint times, reduce product image transfer sizes, and adopt the current Next.js 16.3 release line.

## Invariants

- Product cards continue to display the configured Vendure preview asset through the Next.js image optimizer.
- The first featured product image loads with high priority, and other product images load lazily.
- Storefront metadata and alternate-language links remain unchanged.
- Next.js and `eslint-config-next` remain on matching release lines.

## Integration guidance

Preserve custom hero content while removing entrance effects that hide above-the-fold text. Keep the responsive product image sizes compatible with the storefront grid. Retain the asset-origin preconnect when assets use a separate host. Reconcile downstream Next.js configuration with Next.js 16.3 before adopting the dependency update.

## Verification

- Run the storefront checks and production build.
- Confirm the application resolves matching Next.js and `eslint-config-next` 16.3 versions.
- Audit the home page with Lighthouse and confirm that the asset preconnect and next-generation image checks pass.
