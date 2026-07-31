# Storefront upgrades

The upgrade workflow preserves developer ownership of the source. Deterministic scripts prepare and verify context; an agent or human performs semantic reconciliation.

## New storefront initialization

The first managed release is `v1.0.0`. After creating a storefront from an immutable release tag, initialize exact provenance:

```bash
npm run upgrade:init
git add .vendure/storefront.json
git commit -m "chore: initialize storefront provenance"
```

The checked-in template cannot contain its own Git commit hash, so initialization resolves the release tag once, verifies that its tree exactly matches `HEAD`, and records it. Initialization fails if the storefront was created from another branch or commit.

## Managed upgrade

Begin from a clean worktree on a dedicated upgrade branch:

```bash
npm run upgrade:prepare -- 1.1.0
```

Preparation does not modify storefront source. It creates a gitignored workspace under `.vendure/upgrade-workspace/` containing old and new upstream snapshots, the upstream patch, ordered release guides, and `INTEGRATION.md`.

Read the integration brief, reconcile upstream intent with downstream customizations, and write the required report path named by the brief. Downstream intent wins by default. If an upstream invariant and a customization cannot coexist, record the tradeoff rather than silently discarding either side.

Then run:

```bash
npm run upgrade:verify
npm run upgrade:finalize
```

Verification runs the commands configured in `.vendure/storefront.json` and fingerprints the reviewed worktree. Finalization refuses changes made after verification, advances provenance, and removes the temporary workspace. Commit the source, upgrade report, and provenance update together.

Release tags are expected to be immutable. If an upstream tag was intentionally moved, preparation stops with the recorded baseline hash. After independently verifying the incident and confirming that hash is still available locally, acknowledge that exact baseline explicitly:

```bash
npm run upgrade:prepare -- 1.1.0 --allow-moved-baseline <recorded-commit>
```

This keeps the recorded commit as the three-way baseline; it does not silently trust the replacement tag.

## Legacy onboarding

Storefronts created before `v1.0.0` have no reliable three-way baseline. Their one-time onboarding is explicitly best effort:

```bash
npm run upgrade:prepare -- 1.0.0 --legacy
```

Because those repositories predate the protocol scripts, first copy the upgrade-support files and npm scripts from the immutable `v1.0.0` tag or ask an agent to bootstrap them. After semantic reconciliation, reporting, verification, and finalization, later upgrades use exact baseline and target snapshots.

## Authoring an upstream change

Copy `.upgrades/changes/_example.md` to a unique filename and record:

- Intent
- Affected module areas
- Behavioral invariants
- Integration guidance
- Focused verification

`type: major` identifies a breaking change; a separate `breaking` field is intentionally not used.

Use a `.none.md` file only when a downstream-impacting diff genuinely has no downstream impact, and explain why. CI requires the pull request to add a note or exemption; modifying or deleting an existing note does not satisfy the gate. Added notes must declare every module area inferred from the impactful paths. CI validates the note or exemption:

```bash
npm run upgrade:validate
```

Prepare the first managed baseline without creating its tag:

```bash
npm run upgrade:release -- 1.0.0 --initial
```

Prepare later releases without `--initial`:

```bash
npm run upgrade:release -- 1.1.0
```

The release command requires a clean Git worktree, validates all inputs before mutation, aggregates and consumes pending notes, updates the starter version, and generates `.upgrades/releases/v1.1.0/manifest.json` plus `guide.md`. Review and commit those artifacts before creating the immutable `v1.1.0` tag.
