---
type: patch
areas:
  - authentication
---

## Intent

Allow registration verification links to complete without invoking a Next.js Server Action during the verification Client Component's initial render.

## Invariants

- A verification token is submitted automatically after the verification page hydrates.
- A returned Vendure auth token is still stored by the Server Action.
- Missing, invalid, and expired verification tokens retain their existing user-facing outcomes.
- React development effect replay does not submit the same verification token twice.
- When the token changes without remounting the page, results from earlier tokens are ignored and an already-requested token is not submitted again.
- A verification request that rejects resolves to the failure state rather than an indefinite loading state.

## Integration guidance

Keep downstream verification-page presentation and navigation customizations, but invoke the verification Server Action from a post-render effect and represent loading as its own component rather than passing a render-created Server Action promise into a Client Component.

## Verification

- Request a localized verification URL and confirm its server-rendered response contains neither the initial-render Server Function error nor the cookie mutation error.
- Hydrate the page with an invalid token and confirm it transitions from the loading state to the failure state.
- Hydrate the page with the Server Action endpoint unreachable and confirm it transitions from the loading state to the failure state.
- Change the token through client-side navigation while verification is pending and confirm only the current token's result is displayed.
