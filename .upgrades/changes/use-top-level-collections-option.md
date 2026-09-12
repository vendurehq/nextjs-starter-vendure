---
type: patch
areas:
  - collections
---

## Intent

Query top-level collections using the native `topLevelOnly: true` option instead of filtering by `parentId: "1"`. Different channels have different root collections, so collection ID 1 cannot be assumed to be the root.

## Invariants

- `GetTopCollectionsQuery` continues to return top-level collections for the active channel.

## Integration guidance

No special integration steps are required unless downstream customizations relied on filtering by parent ID "1". Upstream now queries top-level collections natively via `options: { topLevelOnly: true }`.

## Verification

- Confirm `GetTopCollectionsQuery` returns top-level collections as expected.
- Run `npm run upgrade:validate` and `npm run check-types`.
