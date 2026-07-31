# Agent guidance

- Use conventional commit messages.
- Treat all human-authored storefront source as developer-owned and customizable.
- Preserve downstream intent during upgrades unless it violates an explicit upstream invariant; surface irreconcilable tradeoffs.
- Keep Next.js files under `src/app/` thin and place substantial behavior in the owning feature.
- Import another feature through its top-level modules, never through its `components/` or `routes/` internals.
- Colocate GraphQL operations and translations with their owning feature.
- Add or explicitly exempt an upgrade note for every downstream-impacting pull request.
- Run `npm run upgrade:validate`, tests, lint, type checks, and the production build before declaring work complete.
