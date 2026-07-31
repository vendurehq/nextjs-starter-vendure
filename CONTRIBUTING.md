# Contributing

Use conventional commit messages and keep changes localized to the feature or platform module that owns the behavior.

Pull requests that affect downstream storefront source, runtime dependencies, configuration, generated-code inputs, or repository structure must include an upgrade note under `.upgrades/changes/`. Start from `_example.md`. A deliberate `.none.md` exemption is allowed only with a concrete reason.

Before submitting, run:

```bash
npm run upgrade:validate
npm test
npm run lint
npm run check-types
npm run build
```

See [the architecture guide](./docs/architecture.md) for module ownership and [the upgrade guide](./docs/upgrades.md) for the managed release workflow.
