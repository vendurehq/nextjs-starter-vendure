---
type: patch
areas:
  - account
  - authentication
  - cart
  - checkout
  - collections
  - orders
  - products
  - search
  - platform.i18n
  - site
  - tooling
---

## Intent

Harden provenance, release authoring, change-note validation, verification fingerprints, locale registration, and architecture boundaries after an adversarial review of the initial managed-upgrade protocol.

## Invariants

- Managed upgrades retain exact, inspectable baseline and target commits.
- Release preparation never consumes uncommitted notes or begins from an invalid configuration.
- Feature routes keep their current metadata and route behavior while depending only on lower-level shared modules.
- English and German message files remain complete and registered under the correct locale.

## Integration guidance

Preserve downstream configuration modules and feature boundaries. If a recorded upstream tag has moved, verify the incident before using the explicit moved-baseline acknowledgement documented in `docs/upgrades.md`. Existing release directories must use stable `vMAJOR.MINOR.PATCH` names.

## Verification

- Run the upgrade protocol, validation, i18n, and architecture regression tests.
- Run upgrade validation, lint, Next.js type generation, and the production build.
