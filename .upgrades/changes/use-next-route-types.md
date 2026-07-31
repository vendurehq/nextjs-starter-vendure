---
type: patch
areas:
  - platform.next
  - tooling
---

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
