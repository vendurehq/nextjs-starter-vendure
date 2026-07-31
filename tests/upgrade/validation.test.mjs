import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {renderReleaseGuide} from '../../scripts/lib/upgrade-protocol.mjs';

const repositoryRoot = path.join(import.meta.dirname, '..', '..');
const validateScript = path.join(repositoryRoot, 'scripts/validate-upgrades.mjs');
const releaseScript = path.join(repositoryRoot, 'scripts/storefront-release.mjs');

function git(root, ...args) {
    return execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}

async function write(root, relative, content) {
    const file = path.join(root, relative);
    await mkdir(path.dirname(file), {recursive: true});
    await writeFile(file, content);
}

function note(areas, type = 'patch') {
    return `---
type: ${type}
areas:
${areas.map(area => `  - ${area}`).join('\n')}
---

## Intent
Exercise validation.

## Invariants
- Preserve behavior.

## Integration guidance
Apply the change.

## Verification
- Run tests.
`;
}

async function installSchemas(root) {
    for (const schema of ['storefront.schema.json', 'upgrade-manifest.schema.json']) {
        await write(root, `schemas/${schema}`, await readFile(path.join(repositoryRoot, 'schemas', schema), 'utf8'));
    }
}

async function createValidationFixture(root) {
    git(root, 'init', '-b', 'main');
    git(root, 'config', 'user.email', 'fixture@example.com');
    git(root, 'config', 'user.name', 'Upgrade Fixture');
    await installSchemas(root);
    await write(root, '.vendure/storefront.json', JSON.stringify({
        $schema: 'fixture',
        upstream: 'fixture',
        version: '1.0.0',
        commit: null,
        verification: ['true'],
    }));
    await write(root, '.upgrades/areas.json', JSON.stringify(['cart', 'tooling']));
    await write(root, '.upgrades/changes/README.md', '# Upgrade notes\n');
    await write(root, '.upgrades/changes/existing.md', note(['cart']));
    const manifest = {
        $schema: '../../../schemas/upgrade-manifest.schema.json',
        version: '1.0.0',
        previousVersion: null,
        initial: true,
        changes: [],
    };
    await write(root, '.upgrades/releases/v1.0.0/manifest.json', JSON.stringify(manifest));
    await write(root, '.upgrades/releases/v1.0.0/guide.md', renderReleaseGuide(manifest));
    await write(root, 'src/features/cart/value.ts', 'export const value = 1;\n');
    await write(root, 'package.json', JSON.stringify({version: '1.0.0'}));
    git(root, 'add', '.');
    git(root, 'commit', '-m', 'test: create validation fixture');
}

test('change-note validation requires an added note covering the changed area', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-validation-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await createValidationFixture(temporary);
    const base = git(temporary, 'rev-parse', 'HEAD');

    await write(temporary, 'src/features/cart/value.ts', 'export const value = 2;\n');
    await write(temporary, '.upgrades/changes/existing.md', `${note(['cart'])}\n`);
    git(temporary, 'add', '.');
    git(temporary, 'commit', '-m', 'test: modify an existing note');
    let result = spawnSync(process.execPath, [validateScript, '--base', base], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /without an upgrade note/);

    await write(temporary, '.upgrades/changes/new.md', note(['tooling']));
    git(temporary, 'add', '.');
    git(temporary, 'commit', '-m', 'test: add wrong-area note');
    result = spawnSync(process.execPath, [validateScript, '--base', base], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /do not cover changed areas: cart/);

    await write(temporary, '.upgrades/changes/new.md', note(['cart']));
    git(temporary, 'add', '.');
    git(temporary, 'commit', '-m', 'test: cover changed area');
    result = spawnSync(process.execPath, [validateScript, '--base', base], {cwd: temporary, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
});

test('a release manifest covers impactful changes after pending notes are consumed', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-release-validation-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await createValidationFixture(temporary);
    const base = git(temporary, 'rev-parse', 'HEAD');

    await write(temporary, 'src/features/cart/value.ts', 'export const value = 2;\n');
    await rm(path.join(temporary, '.upgrades/changes/existing.md'));
    const manifest = {
        $schema: '../../../schemas/upgrade-manifest.schema.json',
        version: '1.0.1',
        previousVersion: '1.0.0',
        initial: false,
        changes: [{
            id: 'cart-change',
            type: 'patch',
            areas: ['cart'],
            content: note(['cart']).replace(/^---[\s\S]*?---\n/, '').trim(),
        }],
    };
    await write(temporary, '.upgrades/releases/v1.0.1/manifest.json', JSON.stringify(manifest));
    await write(temporary, '.upgrades/releases/v1.0.1/guide.md', renderReleaseGuide(manifest));
    git(temporary, 'add', '.');
    git(temporary, 'commit', '-m', 'test: consume note into release manifest');

    const result = spawnSync(process.execPath, [validateScript, '--base', base], {cwd: temporary, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
});

test('release preparation refuses a dirty tree without consuming notes', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-release-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await createValidationFixture(temporary);
    const noteFile = path.join(temporary, '.upgrades/changes/uncommitted.md');
    await writeFile(noteFile, note(['cart']));

    const result = spawnSync(process.execPath, [releaseScript, '1.1.0'], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /worktree must be clean/);
    assert.match(await readFile(noteFile, 'utf8'), /Exercise validation/);
});

test('validation executes config and manifest schemas and detects guide drift', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-schema-validation-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await createValidationFixture(temporary);

    const configFile = path.join(temporary, '.vendure/storefront.json');
    const config = JSON.parse(await readFile(configFile, 'utf8'));
    config.commit = 'NOT-A-SHA';
    config.verification = [123, {nope: true}];
    config.bogus = true;
    await writeFile(configFile, JSON.stringify(config));
    let result = spawnSync(process.execPath, [validateScript], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /storefront\.schema\.json/);
    assert.match(result.stderr, /additional properties/);
    assert.match(result.stderr, /must match pattern/);

    config.commit = null;
    config.verification = ['true'];
    delete config.bogus;
    await writeFile(configFile, JSON.stringify(config));
    const manifestFile = path.join(temporary, '.upgrades/releases/v1.0.0/manifest.json');
    const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
    manifest.bogus = true;
    await writeFile(manifestFile, JSON.stringify(manifest));
    result = spawnSync(process.execPath, [validateScript], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /upgrade-manifest\.schema\.json/);

    delete manifest.bogus;
    await writeFile(manifestFile, JSON.stringify(manifest));
    await writeFile(path.join(temporary, '.upgrades/releases/v1.0.0/guide.md'), '# drifted\n');
    result = spawnSync(process.execPath, [validateScript], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /guide\.md does not match its manifest/);
});

test('release preparation enforces version flags and bump rank before a successful release', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-release-version-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await createValidationFixture(temporary);

    const noteFile = path.join(temporary, '.upgrades/changes/existing.md');
    await writeFile(noteFile, note(['cart'], 'major'));
    git(temporary, 'add', '.upgrades/changes/existing.md');
    git(temporary, 'commit', '-m', 'test: require a major storefront release');

    let result = spawnSync(process.execPath, [releaseScript, '2.0.0', '--initial'], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Only the first managed release may use --initial/);

    result = spawnSync(process.execPath, [releaseScript, '0.9.0'], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /must be newer than v1\.0\.0/);

    result = spawnSync(process.execPath, [releaseScript, '1.1.0'], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /require a major release/);
    assert.match(await readFile(noteFile, 'utf8'), /type: major/);

    result = spawnSync(process.execPath, [releaseScript, '2.0.0'], {cwd: temporary, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    await assert.rejects(readFile(noteFile, 'utf8'), error => error.code === 'ENOENT');
    const manifest = JSON.parse(await readFile(path.join(temporary, '.upgrades/releases/v2.0.0/manifest.json'), 'utf8'));
    assert.equal(manifest.changes[0].type, 'major');
    assert.equal(
        await readFile(path.join(temporary, '.upgrades/releases/v2.0.0/guide.md'), 'utf8'),
        renderReleaseGuide(manifest),
    );
    assert.equal(JSON.parse(await readFile(path.join(temporary, 'package.json'), 'utf8')).version, '2.0.0');
    assert.equal(JSON.parse(await readFile(path.join(temporary, '.vendure/storefront.json'), 'utf8')).version, '2.0.0');
});

test('the first managed release requires an explicit initial flag', async t => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'vendure-storefront-initial-release-'));
    t.after(() => rm(temporary, {recursive: true, force: true}));
    await createValidationFixture(temporary);
    await rm(path.join(temporary, '.upgrades/releases/v1.0.0'), {recursive: true});
    git(temporary, 'add', '.upgrades/releases');
    git(temporary, 'commit', '-m', 'test: remove the managed release baseline');

    let result = spawnSync(process.execPath, [releaseScript, '1.0.0'], {cwd: temporary, encoding: 'utf8'});
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /first managed release requires --initial/);

    result = spawnSync(process.execPath, [releaseScript, '1.0.0', '--initial'], {cwd: temporary, encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const manifest = JSON.parse(await readFile(path.join(temporary, '.upgrades/releases/v1.0.0/manifest.json'), 'utf8'));
    assert.equal(manifest.initial, true);
    assert.equal(manifest.previousVersion, null);
});
