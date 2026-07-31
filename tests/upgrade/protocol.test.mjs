import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp, mkdir, readFile, rm, symlink, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
    finalizeUpgrade,
    initializeStorefront,
    listReleaseVersions,
    parseUpgradeNote,
    prepareUpgrade,
    readJson,
    readStorefrontConfig,
    verifyUpgrade,
    worktreeFingerprint,
} from '../../scripts/lib/upgrade-protocol.mjs';

const repositoryRoot = path.join(import.meta.dirname, '..', '..');

function git(root, ...args) {
    return execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}

async function write(root, relative, content) {
    const file = path.join(root, relative);
    await mkdir(path.dirname(file), {recursive: true});
    await writeFile(file, content);
}

async function installSchemas(root) {
    for (const schema of ['storefront.schema.json', 'upgrade-manifest.schema.json']) {
        await write(root, `schemas/${schema}`, await readFile(path.join(repositoryRoot, 'schemas', schema), 'utf8'));
    }
}

async function createUpstreamFixture(base) {
    const upstream = path.join(base, 'upstream');
    await mkdir(upstream);
    git(upstream, 'init', '-b', 'main');
    git(upstream, 'config', 'user.email', 'fixture@example.com');
    git(upstream, 'config', 'user.name', 'Upgrade Fixture');
    await write(upstream, '.gitignore', '.vendure/upgrade-workspace/\n');
    await installSchemas(upstream);
    await write(upstream, 'src/value.txt', 'upstream v1\n');
    await write(upstream, '.upgrades/releases/v1.0.0/manifest.json', JSON.stringify({version: '1.0.0', changes: []}));
    await write(upstream, '.upgrades/releases/v1.0.0/guide.md', '# Vendure storefront v1.0.0\n');
    await write(upstream, '.vendure/storefront.json', JSON.stringify({
        $schema: 'https://raw.githubusercontent.com/vendurehq/nextjs-starter-vendure/main/schemas/storefront.schema.json',
        upstream,
        version: '1.0.0',
        commit: null,
        verification: ['node -e "process.exit(0)"'],
    }, null, 2));
    git(upstream, 'add', '.');
    git(upstream, 'commit', '-m', 'feat: create managed baseline');
    git(upstream, 'tag', 'v1.0.0');

    await write(upstream, 'src/value.txt', 'upstream v1.1\n');
    await write(upstream, '.upgrades/releases/v1.1.0/manifest.json', JSON.stringify({version: '1.1.0', changes: []}));
    await write(upstream, '.upgrades/releases/v1.1.0/guide.md', '# Vendure storefront v1.1.0\n');
    git(upstream, 'add', '.');
    git(upstream, 'commit', '-m', 'feat: add fixture improvement');
    git(upstream, 'tag', 'v1.1.0');
    return upstream;
}

async function cloneBaseline(upstream, downstream) {
    execFileSync('git', ['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--branch', 'v1.0.0', upstream, downstream]);
    git(downstream, 'switch', '-c', 'storefront-upgrade-fixture');
    git(downstream, 'config', 'user.email', 'fixture@example.com');
    git(downstream, 'config', 'user.name', 'Upgrade Fixture');
}

test('upgrade notes combine structured metadata with required agent context', () => {
    const note = parseUpgradeNote(`---
type: minor
areas:
  - cart
---

## Intent
Add a capability.

## Invariants
- Preserve custom carts.

## Integration guidance
Merge semantically.

## Verification
- Exercise the cart.
`, 'cart-capability', ['cart']);
    assert.equal(note.type, 'minor');
    assert.deepEqual(note.areas, ['cart']);
    assert.match(note.content, /Preserve custom carts/);

    assert.throws(() => parseUpgradeNote(`---
type: patch
areas: [unknown]
---
`, 'invalid', ['cart']), /unknown area/);

    assert.throws(() => parseUpgradeNote(`---
type: patch
areas: [cart]
---

## Intent

## Invariants
- Preserve carts.

## Integration guidance
Merge semantically.

## Verification
- Exercise the cart.
`, 'empty', ['cart']), /empty "## Intent" section/);
});

test('storefront configuration is validated against its JSON schema', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-schema-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await installSchemas(temporary);
    await write(temporary, '.vendure/storefront.json', JSON.stringify({
        $schema: 'fixture',
        upstream: 'fixture',
        version: '1.0.0',
        commit: 'NOT-A-SHA',
        verification: [123, {nope: true}],
        bogus: true,
    }));
    await assert.rejects(readStorefrontConfig(temporary), error => {
        assert.match(error.message, /storefront\.schema\.json/);
        assert.match(error.message, /additional properties/);
        assert.match(error.message, /must match pattern/);
        assert.match(error.message, /must be string/);
        return true;
    });
});

test('release directories use one strict version convention', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-releases-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await mkdir(path.join(temporary, 'v1.0.0'));
    await mkdir(path.join(temporary, 'v1.1.0-rc.1'));
    await assert.rejects(listReleaseVersions(temporary), /Invalid release directory "v1\.1\.0-rc\.1"/);
});

test('upgrade operations reject dirty initialization and support legacy onboarding', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-legacy-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const upstream = await createUpstreamFixture(temporary);

    const dirty = path.join(temporary, 'dirty');
    await cloneBaseline(upstream, dirty);
    await write(dirty, 'untracked.txt', 'dirty\n');
    await assert.rejects(initializeStorefront(dirty), /worktree must be clean/);

    const legacy = path.join(temporary, 'legacy');
    await cloneBaseline(upstream, legacy);
    const prepared = await prepareUpgrade(legacy, '1.0.0', {legacy: true});
    const state = await readJson(path.join(prepared.contextDirectory, 'state.json'));
    assert.equal(state.legacy, true);
    assert.equal(state.baselineCommit, null);
    assert.match(await readFile(path.join(prepared.contextDirectory, 'INTEGRATION.md'), 'utf8'), /best-effort two-way onboarding/);
});

test('verification requires a complete report and propagates command failures', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-verification-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const upstream = await createUpstreamFixture(temporary);
    const downstream = path.join(temporary, 'downstream');
    await cloneBaseline(upstream, downstream);

    await initializeStorefront(downstream);
    git(downstream, 'add', '.vendure/storefront.json');
    git(downstream, 'commit', '-m', 'chore: initialize storefront provenance');
    const prepared = await prepareUpgrade(downstream, '1.1.0');

    await assert.rejects(verifyUpgrade(downstream), /Create the required upgrade report/);
    await write(downstream, prepared.reportPath, `# Upgrade report

## Integrated upstream changes

## Preserved customizations
Preserved.

## Deviations and deferred changes
None.

## Verification
Pending.
`);
    await assert.rejects(verifyUpgrade(downstream), /empty "## Integrated upstream changes" section/);

    const configFile = path.join(downstream, '.vendure/storefront.json');
    const config = await readJson(configFile);
    config.verification = ['node -e "process.exit(7)"'];
    await writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`);
    await write(downstream, prepared.reportPath, `# Upgrade report

## Integrated upstream changes
Integrated.

## Preserved customizations
Preserved.

## Deviations and deferred changes
None.

## Verification
Ran checks.
`);
    await assert.rejects(verifyUpgrade(downstream), /Verification failed/);
});

test('detached downstream repositories prepare, verify, and finalize an upgrade', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-upgrade-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const upstream = await createUpstreamFixture(temporary);
    const downstream = path.join(temporary, 'downstream');
    await cloneBaseline(upstream, downstream);

    const initialized = await initializeStorefront(downstream);
    assert.equal(initialized.commit, git(upstream, 'rev-parse', 'v1.0.0^{commit}'));
    assert.equal(git(downstream, 'for-each-ref', '--format=%(refname)', 'refs/storefront-upgrades'), '');
    git(downstream, 'add', '.vendure/storefront.json');
    git(downstream, 'commit', '-m', 'chore: initialize storefront provenance');

    await write(downstream, 'src/value.txt', 'downstream customization\n');
    git(downstream, 'add', 'src/value.txt');
    git(downstream, 'commit', '-m', 'feat: customize storefront');

    const prepared = await prepareUpgrade(downstream, '1.1.0');
    assert.equal(git(downstream, 'for-each-ref', '--format=%(refname)', 'refs/storefront-upgrades'), '');
    assert.equal(await readFile(path.join(downstream, 'src/value.txt'), 'utf8'), 'downstream customization\n');
    assert.match(await readFile(path.join(prepared.contextDirectory, 'INTEGRATION.md'), 'utf8'), /Downstream intent wins/);
    assert.equal(await readFile(path.join(prepared.contextDirectory, 'baseline/src/value.txt'), 'utf8'), 'upstream v1\n');
    assert.equal(await readFile(path.join(prepared.contextDirectory, 'target/src/value.txt'), 'utf8'), 'upstream v1.1\n');

    const report = `# Upgrade report

## Integrated upstream changes
Integrated the fixture intent.

## Preserved customizations
Kept the downstream value.

## Deviations and deferred changes
None.

## Verification
All configured checks passed.
`;
    await write(downstream, prepared.reportPath, report);
    await verifyUpgrade(downstream);

    await write(downstream, prepared.reportPath, `${report}\nchanged after verification\n`);
    await assert.rejects(finalizeUpgrade(downstream), /changed after verification/);
    await write(downstream, prepared.reportPath, report);

    const finalized = await finalizeUpgrade(downstream);
    assert.equal(finalized.version, '1.1.0');
    assert.equal(finalized.commit, git(upstream, 'rev-parse', 'v1.1.0^{commit}'));
});

test('initialization rejects a clean tree that does not match its configured release', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-init-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const upstream = await createUpstreamFixture(temporary);
    const downstream = path.join(temporary, 'downstream');
    execFileSync('git', ['clone', '--quiet', upstream, downstream]);

    await assert.rejects(initializeStorefront(downstream), /does not match upstream v1\.0\.0/);
    const config = await readJson(path.join(downstream, '.vendure/storefront.json'));
    assert.equal(config.commit, null);
    assert.equal(git(downstream, 'for-each-ref', '--format=%(refname)', 'refs/storefront-upgrades'), '');
});

test('an explicitly acknowledged moved tag uses the recorded commit as baseline', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-moved-tag-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const upstream = await createUpstreamFixture(temporary);
    const downstream = path.join(temporary, 'downstream');
    await cloneBaseline(upstream, downstream);

    const initialized = await initializeStorefront(downstream);
    git(downstream, 'add', '.vendure/storefront.json');
    git(downstream, 'commit', '-m', 'chore: initialize storefront provenance');
    git(upstream, 'tag', '--force', 'v1.0.0', 'v1.1.0');

    await assert.rejects(prepareUpgrade(downstream, '1.1.0'), /--allow-moved-baseline/);
    const prepared = await prepareUpgrade(downstream, '1.1.0', {allowMovedBaseline: initialized.commit});
    assert.equal(await readFile(path.join(prepared.contextDirectory, 'baseline/src/value.txt'), 'utf8'), 'upstream v1\n');
});

test('worktree fingerprints include ignored environment and survive a content-preserving commit', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-fingerprint-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    git(temporary, 'init', '-b', 'main');
    git(temporary, 'config', 'user.email', 'fixture@example.com');
    git(temporary, 'config', 'user.name', 'Upgrade Fixture');
    await write(temporary, '.gitignore', '.env*\n');
    await write(temporary, 'tracked.txt', 'before\n');
    git(temporary, 'add', '.');
    git(temporary, 'commit', '-m', 'test: create fingerprint fixture');

    await write(temporary, '.env.local', 'TOKEN=first\n');
    const beforeEnvironmentChange = worktreeFingerprint(temporary);
    await write(temporary, '.env.local', 'TOKEN=second\n');
    assert.notEqual(worktreeFingerprint(temporary), beforeEnvironmentChange);

    await write(temporary, 'tracked.txt', 'after\n');
    await mkdir(path.join(temporary, 'directory'));
    await symlink('directory', path.join(temporary, 'directory-link'));
    const beforeCommit = worktreeFingerprint(temporary);
    git(temporary, 'add', 'tracked.txt', 'directory-link');
    git(temporary, 'commit', '-m', 'test: preserve fingerprint content');
    assert.equal(worktreeFingerprint(temporary), beforeCommit);
});
