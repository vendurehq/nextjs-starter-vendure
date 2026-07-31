# Keep the storefront source-distributed and agent-upgradable

The storefront remains entirely developer-owned source instead of moving customizable behavior into Vendure runtime packages. Upgrades reconcile tagged upstream snapshots with downstream intent using structured change context and verification, accepting semantic integration work in exchange for maximum customizability and agent independence.

## Considered options

Git-only fork syncing leaves agents to reconstruct intent from diffs, while packaging most storefront behavior improves dependency updates by making core source harder to customize. The chosen model combines exact Git provenance with authored upgrade notes, local feature ownership, and repository-local scripts.

## Consequences

Upstream contributors must describe downstream-impacting changes, release tags are immutable protocol inputs, and some upgrades still require explicit human or agent judgment. No upgrade tool may silently treat upstream files as authoritative over customized downstream behavior.
