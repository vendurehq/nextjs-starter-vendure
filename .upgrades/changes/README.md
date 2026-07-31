# Upgrade notes

Every pull request with downstream impact adds one Markdown file to this directory. Use `_example.md` as the authoring reference, but choose a unique descriptive filename for the real note. Release preparation consumes and removes note files other than this README and underscore-prefixed templates.

Required headings are `Intent`, `Invariants`, `Integration guidance`, and `Verification`, and every section must contain guidance. Use `type: major` for breaking changes; breaking status is derived from the release type. Run `npm run upgrade:validate` before submitting.
