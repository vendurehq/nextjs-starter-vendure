# Customizing This Storefront

This starter is designed so you can keep pulling upstream changes after you have customized a storefront. The main rule is simple: prefer the `src/storefront` customization layer before editing upstream-owned application code.

## Ownership Boundaries

Downstream-owned files:

- `src/storefront/**`
- `messages/**`
- `public/**`
- `src/graphql-env.d.ts` after you connect your own Vendure backend and regenerate GraphQL types

Mostly upstream-owned files:

- `src/app/**`
- `src/lib/vendure/**`
- `src/lib/commerce/**`
- `src/components/commerce/**`
- `src/components/layout/**`
- `src/components/ui/**`

Editing upstream-owned files is allowed, but it means you are forking that route, integration, component, or UI primitive. Future upstream updates may conflict there. Prefer `src/storefront` first.

## Common Customizations

Use `src/storefront/config.ts` for data-level customization:

- site name, URL, and logo defaults
- enabled locales and locale display names
- footer links
- catalog page size and top-level collection behavior
- checkout payment metadata
- checkout address field policy
- homepage feature keys
- product trust badge and FAQ keys

Use `src/storefront/views/**` for structural customization. Routes keep owning fetching, caching, metadata, redirects, and request context; storefront views own page structure.

Use `src/storefront/components/**` for small high-variance slots such as the logo, homepage hero, product FAQ, trust badges, and footer legal content.

Use `src/lib/commerce/actions/**` and `src/components/commerce/**` for reusable commerce mechanics. Shared and storefront code must not import from `src/app/**`; ESLint enforces that boundary.

## Typed Vendure Custom Fields

Custom fields should be typed by gql.tada, not by hand-written TypeScript interfaces.

1. Point GraphQL type generation at your Vendure Shop API.
2. Regenerate `src/graphql-env.d.ts` with `npm run graphql:generate`.
3. Select custom fields in `src/storefront/vendure/*`.
4. Consume the selected fields from the matching storefront view or component.

Example:

```ts
export const StorefrontProductFragment = graphql(`
  fragment StorefrontProduct on Product {
    customFields {
      careInstructions
      material
    }
  }
`)
```

The product view prop builder merges `readStorefrontProduct(product)` into the product object, so a customized view can read selected fields directly:

```tsx
product.customFields.careInstructions
```

Do not manually merge a conflicted `src/graphql-env.d.ts`. Regenerate it from your Vendure backend after resolving source conflicts.

## Updating From Upstream

If this project was cloned or forked, keep an upstream remote:

```bash
git remote add upstream https://github.com/vendure-ecommerce/nextjs-starter-vendure.git
git fetch upstream
git merge upstream/main
npm install
npm run graphql:generate
npm run graphql:check
npm run check-types
npm run lint
```

When conflicts happen, resolve customized `src/storefront`, `messages`, and `public` files as your project code. For generated GraphQL types, resolve source files first and then regenerate. If you intentionally edited an upstream-owned file, treat that file as a fork and review upstream changes manually before accepting either side.

## When To Fork Core Code

Some store builds need deeper structural changes. That is fine. Make the tradeoff explicit:

- editing `src/storefront/views/product-detail-view.tsx` customizes product structure with low upstream merge cost
- editing `src/app/[locale]/product/[slug]/page.tsx` forks the product route and may conflict with upstream route, metadata, cache, or data-fetching changes
- editing `src/lib/vendure/**` forks the Vendure integration contract
- editing `src/lib/commerce/actions/**` forks shared storefront behavior
- editing `src/components/ui/**` forks generated UI primitives

Prefer local overrides first, then fork core files intentionally when the customization really belongs there.
