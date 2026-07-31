# Storefront distribution

This context describes how Vendure's starter source and a developer-owned storefront relate across releases.

## Language

**Upstream starter**:
The Vendure-maintained source distribution from which downstream storefronts originate.
_Avoid_: Framework, runtime package

**Downstream storefront**:
A developer-owned and freely customized copy of the upstream starter.
_Avoid_: Installation, generated app

**Managed baseline**:
The exact tagged upstream release against which a downstream storefront's later changes can be understood.
_Avoid_: Dependency version, merge base

**Upstream intent**:
The reason for an upstream change together with the behavior that the change must preserve.
_Avoid_: Patch, file diff

**Upgrade note**:
An upstream contributor's structured account of a change's intent, affected areas, invariants, integration guidance, and verification.
_Avoid_: Changelog entry

**Release manifest**:
The ordered collection of upgrade notes belonging to one tagged upstream release.
_Avoid_: Release notes

**Storefront provenance**:
The managed baseline currently adopted by a downstream storefront.
_Avoid_: Package version

**Legacy storefront**:
A downstream storefront created before the first managed baseline and therefore lacking exact upstream provenance.
_Avoid_: Unsupported storefront

**Upgrade report**:
A downstream record of the upstream changes integrated, customizations preserved, deviations made, and verification performed.
_Avoid_: Agent log
