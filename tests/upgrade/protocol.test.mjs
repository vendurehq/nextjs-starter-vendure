import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
    finalizeUpgrade,
    initializeStorefront,
    parseUpgradeNote,
    prepareUpgrade,
    readJson,
    verifyUpgrade,
    writeJson,
} from '../../scripts/lib/upgrade-protocol.mjs';

function git(root, ...args) {
    return execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}

async function write(root, relative, content) {
    const file = path.join(root, relative);
    await mkdir(path.dirname(file), {recursive: true});
    await writeFile(file, content);
}

async function createUpstreamFixture(base) {
    const upstream = path.join(base, 'upstream');
    await mkdir(upstream);
    git(upstream, 'init', '-b', 'main');
    git(upstream, 'config', 'user.email', 'fixture@example.com');
    git(upstream, 'config', 'user.name', 'Upgrade Fixture');
    await write(upstream, '.gitignore', '.vendure/upgrade-workspace/\n');
    await write(upstream, 'src/value.txt', 'upstream v1\n');
    await write(upstream, '.upgrades/releases/v1.0.0/manifest.json', JSON.stringify({version: '1.0.0', changes: []}));
    await write(upstream, '.upgrades/releases/v1.0.0/guide.md', '# Vendure storefront v1.0.0\n');
    await write(upstream, '.vendure/storefront.json', JSON.stringify({
        upstream,
        version: '1.0.0',
        commit: null,
        root: '.',
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

test('upgrade notes combine structured metadata with required agent context', () => {
    const note = parseUpgradeNote(`---
type: minor
areas:
  - cart
breaking: false
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
breaking: false
---
`, 'invalid', ['cart']), /unknown area/);
});

test('detached downstream repositories prepare, verify, and finalize an upgrade', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-upgrade-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    const upstream = await createUpstreamFixture(temporary);
    const downstream = path.join(temporary, 'downstream');
    execFileSync('git', ['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--branch', 'v1.0.0', upstream, downstream]);
    git(downstream, 'switch', '-c', 'storefront-upgrade-fixture');
    git(downstream, 'config', 'user.email', 'fixture@example.com');
    git(downstream, 'config', 'user.name', 'Upgrade Fixture');

    const configFile = path.join(downstream, '.vendure/storefront.json');
    const config = await readJson(configFile);
    config.upstream = upstream;
    await writeJson(configFile, config);
    git(downstream, 'add', '.vendure/storefront.json');
    git(downstream, 'commit', '-m', 'chore: configure storefront provenance');

    const initialized = await initializeStorefront(downstream);
    assert.equal(initialized.commit, git(upstream, 'rev-parse', 'v1.0.0^{commit}'));
    git(downstream, 'add', '.vendure/storefront.json');
    git(downstream, 'commit', '-m', 'chore: initialize storefront provenance');

    await write(downstream, 'src/value.txt', 'downstream customization\n');
    git(downstream, 'add', 'src/value.txt');
    git(downstream, 'commit', '-m', 'feat: customize storefront');

    const prepared = await prepareUpgrade(downstream, '1.1.0');
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
