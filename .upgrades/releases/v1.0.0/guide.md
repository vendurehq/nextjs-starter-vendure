# Vendure storefront v1.0.0

This is the first managed storefront baseline. Structured three-way upgrades are supported from this release onward.

Storefronts created before this release can use the best-effort legacy preparation flow:

```bash
npm run upgrade:prepare -- 1.0.0 --legacy
```

The legacy integration is complete only after the storefront passes its configured verification and records `v1.0.0` through `npm run upgrade:finalize`.
