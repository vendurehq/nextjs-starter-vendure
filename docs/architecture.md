# Storefront architecture

The storefront is source-distributed: developers own and may change every human-authored file. Its organization exists to give humans and agents useful locality, not to make parts of the storefront untouchable.

## Source ownership

```text
src/
  app/          Next.js route wiring only
  config/       Store-wide values shared by features and site composition
  features/     Vertical commerce capabilities
  platform/     Cross-cutting Next.js, i18n, revalidation, and Vendure mechanics
  site/         Store-specific composition, navigation, and branding
  components/ui Generic design primitives
```

Feature modules colocate their GraphQL operations, actions, views, messages, and route implementations. The `app/` tree delegates to those route implementations so filesystem routing is not also the primary implementation hotspot.

Dependencies point toward shared configuration and platform mechanics: site modules may compose features, but features must not import from `site/`. ESLint and architecture tests enforce both alias and relative-import boundaries.

## Feature interfaces

A feature's top-level files are its external interface. Its `components/` and `routes/` directories are implementation details. Another feature or site module must not import those internal directories directly; ESLint enforces this rule. Code inside a feature may use its own internals.

Prefer a narrow top-level module such as `features/account/customer.ts` over a catch-all barrel. This keeps server/client boundaries explicit and avoids pulling unrelated exports into bundles.

## GraphQL ownership

Human-authored GraphQL operations live with the feature that owns their behavior. The transport and generated schema types live under `platform/vendure`. Downstream custom fields belong in the relevant feature operation; `src/graphql-env.d.ts` remains generated output and should be regenerated against the downstream Shop API schema.

## Translations

Translations live with their feature or site module. Each owner exposes one top-level locale registration, and `site/i18n/messages.ts` composes those registrations while rejecting duplicate namespaces. Adding a feature touches one composition entry; adding a locale stays local to each owner and the routing configuration.

## Route types

Feature route implementations use Next.js-generated `PageProps` and `LayoutProps` with their concrete filesystem route. This keeps route parameters checked against the `app/` tree even though the thin files under `app/` delegate their implementations to features.
