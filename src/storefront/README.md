# Storefront Customization Layer

This folder is the intended place for project-specific storefront changes.

Use it for:

- site and checkout configuration in `config.ts`
- page structure in `views/**`
- brand/content slots in `components/**`
- typed Vendure custom field fragments in `vendure/**`

Avoid editing `src/app`, `src/lib/vendure`, `src/lib/commerce`, `src/components/commerce`, and `src/components/ui` unless you intentionally want to fork that part of the starter.

See `docs/customizing-storefront.md` for the full update workflow.
