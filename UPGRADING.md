# Upgrading Guide

This guide explains how to sync your customized storefront with upstream Vendure updates while preserving your customizations.

## Prerequisites

Before upgrading, ensure:
- Your working directory is clean (`git status` shows no uncommitted changes)
- All tests pass
- You have a backup or can easily revert

## Adding the Upstream Remote

If you haven't already, add the Vendure upstream repository:

```bash
# Add the upstream remote
git remote add upstream https://github.com/vendure-ecommerce/nextjs-starter.git

# Verify remotes
git remote -v
# Should show both 'origin' (your fork) and 'upstream' (Vendure)
```

## Standard Upgrade Workflow

### Step 1: Fetch Upstream Changes

```bash
# Fetch all upstream branches and tags
git fetch upstream

# View what's changed
git log HEAD..upstream/main --oneline
```

### Step 2: Create an Upgrade Branch

```bash
# Create a new branch for the upgrade
git checkout -b upgrade/vendure-YYYY-MM-DD

# Or use the version number if available
git checkout -b upgrade/vendure-v1.2.0
```

### Step 3: Merge Upstream

```bash
# Merge upstream main into your upgrade branch
git merge upstream/main
```

### Step 4: Resolve Conflicts

If conflicts occur, resolve them following the [Conflict Resolution Guide](#conflict-resolution-guide) below.

### Step 5: Test the Upgrade

```bash
# Install any new dependencies
npm install

# Run type checking
npm run build

# Run tests if available
npm test

# Start dev server and verify functionality
npm run dev
```

### Step 6: Complete the Upgrade

```bash
# Commit any remaining changes
git add .
git commit -m "chore: upgrade to latest upstream"

# Merge into your main branch
git checkout main
git merge upgrade/vendure-YYYY-MM-DD

# Push changes
git push origin main
```

---

## Conflict Resolution Guide

### Understanding the Layered Architecture

The architecture is designed to minimize conflicts:

| Directory | Expected Conflicts | Resolution Strategy |
|-----------|-------------------|---------------------|
| `src/core/` | Rare (should not modify) | Accept upstream |
| `src/merchant/` | Never (your code) | Keep yours |
| `src/config/` | Occasional | Merge carefully |
| `src/app/` | Occasional | Merge carefully |
| `package.json` | Common | Merge dependencies |

### Safe to Accept Upstream (--theirs)

For files you haven't modified in `src/core/`:

```bash
# Accept all upstream changes for core files
git checkout --theirs src/core/

# Then stage the resolved files
git add src/core/
```

### Safe to Keep Yours (--ours)

For merchant customizations:

```bash
# Keep your merchant customizations
git checkout --ours src/merchant/

git add src/merchant/
```

### Requires Manual Merge

**Configuration files** (`src/config/`):

1. Open the conflicted file
2. Review both versions
3. Ensure new registry entries from upstream are included
4. Keep your customizations (overridden imports)

Example conflict in `components.client.registry.ts`:
```typescript
<<<<<<< HEAD (yours)
// Your override
import { ProductCard } from '@merchant/components/overrides/ProductCard';
=======
// New upstream component added
import { ProductCard } from '@core/components/commerce/product-card';
import { NewComponent } from '@core/components/commerce/new-component';
>>>>>>> upstream/main

// Resolution: Keep your override AND add the new component
import { ProductCard } from '@merchant/components/overrides/ProductCard';
import { NewComponent } from '@core/components/commerce/new-component';
```

**Route files** (`src/app/`):

Routes are merchant-owned but may need upstream patterns:
1. Review upstream changes for new patterns or imports
2. Apply relevant changes while keeping your customizations
3. Update imports if core component locations changed

**package.json**:

```bash
# Use npm to resolve
git checkout --theirs package.json
npm install

# Or manually merge, keeping your additions
```

### Conflict Resolution Commands

```bash
# See list of conflicted files
git diff --name-only --diff-filter=U

# Open merge tool
git mergetool

# After resolving, mark as resolved
git add <resolved-file>

# Continue merge
git merge --continue
```

---

## Common Upgrade Scenarios

### New Core Component Added

When upstream adds a new component:

1. The component appears in `src/core/components/`
2. It's added to the registry in `src/config/`
3. It may be used in route files

**Action:** Accept the new component and registry entry. Review if you want to override it.

### Core Component Updated

When upstream updates a component you've overridden:

1. Your override in `src/merchant/components/overrides/` is preserved
2. The core version in `src/core/components/` is updated
3. No conflict occurs

**Action:** Review the upstream changes to see if you want to incorporate improvements into your override.

```bash
# Compare your override to updated core
diff src/merchant/components/overrides/ProductCard.tsx \
     src/core/components/commerce/product-card.tsx
```

### New Configuration Option Added

When upstream adds new config options:

```typescript
// New option added to storefrontConfig
export const storefrontConfig = {
  // Existing options (yours)...

  // New section from upstream
  newFeature: {
    enabled: false,
    option: 'default',
  },
};
```

**Action:** Accept the new options, keeping your existing customizations.

### Dependencies Updated

When upstream updates dependencies:

```bash
# Accept upstream package.json
git checkout --theirs package.json

# Install to update lockfile
npm install

# If you have custom dependencies, add them back
npm install your-custom-package
```

### Breaking Changes

For major version upgrades with breaking changes:

1. Check the upstream CHANGELOG for migration notes
2. Review changes to core components you've overridden
3. Update overrides to match new component signatures
4. Test thoroughly

---

## Keeping Track of Changes

### Before Upgrading

Document your customizations:

```bash
# List all merchant files
find src/merchant -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css"

# List modified config files
git diff --name-only HEAD $(git merge-base HEAD upstream/main) -- src/config/
```

### After Upgrading

Verify customizations still work:

1. Check all overridden components render correctly
2. Verify theme customizations apply in light/dark mode
3. Test custom GraphQL queries
4. Run through critical user flows

---

## Rollback Procedure

If an upgrade causes issues:

```bash
# Option 1: Revert the merge commit
git revert -m 1 <merge-commit-hash>

# Option 2: Reset to before the merge
git reset --hard <commit-before-merge>
git push --force-with-lease origin main  # Use with caution

# Option 3: Create a fix branch
git checkout -b fix/upgrade-issue
# Fix issues, then merge back
```

---

## Automating Upgrades

### GitHub Actions Workflow

Create `.github/workflows/check-upstream.yml`:

```yaml
name: Check Upstream Updates

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Fetch upstream
        run: |
          git remote add upstream https://github.com/vendure-ecommerce/nextjs-starter.git
          git fetch upstream

      - name: Check for updates
        id: check
        run: |
          COMMITS=$(git rev-list HEAD..upstream/main --count)
          echo "commits=$COMMITS" >> $GITHUB_OUTPUT

      - name: Create issue if updates available
        if: steps.check.outputs.commits > 0
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Upstream updates available',
              body: 'There are ${{ steps.check.outputs.commits }} new commits in upstream. Consider upgrading.',
              labels: ['upgrade', 'automated']
            })
```

---

## Best Practices

1. **Upgrade regularly** - Small, frequent updates are easier than large jumps.

2. **Read changelogs** - Check upstream releases for breaking changes before merging.

3. **Test in staging** - Always test upgrades in a staging environment first.

4. **Keep overrides minimal** - The less you override, the fewer potential conflicts.

5. **Document deviations** - Note why you've customized something, so future upgrades are informed.

6. **Use feature branches** - Never merge directly into main; use upgrade branches.

7. **Backup before major upgrades** - Create a tag or backup branch before significant changes.

```bash
# Create a backup tag before major upgrade
git tag backup/pre-upgrade-v2 -m "Backup before v2 upgrade"
git push origin backup/pre-upgrade-v2
```
