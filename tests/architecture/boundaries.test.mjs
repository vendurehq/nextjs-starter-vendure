import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..', '..');
const sourceRoot = path.join(root, 'src');
const featuresRoot = path.join(sourceRoot, 'features');
const platformRoot = path.join(sourceRoot, 'platform');

async function findSourceFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await findSourceFiles(file));
        if (entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)) files.push(file);
    }
    return files;
}

function resolveImport(source, specifier) {
    if (specifier.startsWith('@/')) return path.join(sourceRoot, specifier.slice(2));
    if (specifier.startsWith('.')) return path.resolve(path.dirname(source), specifier);
    return null;
}

test('features do not depend on site composition or another feature internals', async () => {
    const violations = [];
    for (const source of await findSourceFiles(featuresRoot)) {
        const owner = path.relative(featuresRoot, source).split(path.sep)[0];
        const content = await readFile(source, 'utf8');
        for (const match of content.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/g)) {
            const target = resolveImport(source, match[2]);
            if (!target) continue;
            const relativeTarget = path.relative(sourceRoot, target);
            if (relativeTarget === 'site' || relativeTarget.startsWith(`site${path.sep}`)) {
                violations.push(`${path.relative(root, source)} imports ${match[2]}`);
                continue;
            }
            const targetFeature = relativeTarget.match(/^features[/\\]([^/\\]+)[/\\](components|routes)(?:[/\\]|$)/);
            if (targetFeature && targetFeature[1] !== owner) {
                violations.push(`${path.relative(root, source)} imports ${match[2]}`);
            }
        }
    }
    assert.deepEqual(violations, []);
});

test('platform modules do not depend on features or site composition', async () => {
    const violations = [];
    for (const source of await findSourceFiles(platformRoot)) {
        const content = await readFile(source, 'utf8');
        for (const match of content.matchAll(/(?:from\s+|import\s*\()(['"])([^'"]+)\1/g)) {
            const target = resolveImport(source, match[2]);
            if (!target) continue;
            const relativeTarget = path.relative(sourceRoot, target);
            if (/^(?:features|site)(?:[/\\]|$)/.test(relativeTarget)) {
                violations.push(`${path.relative(root, source)} imports ${match[2]}`);
            }
        }
    }
    assert.deepEqual(violations, []);
});

test('feature registries match the feature directories', async () => {
    const features = (await readdir(featuresRoot, {withFileTypes: true}))
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
    const eslint = await readFile(path.join(root, 'eslint.config.mjs'), 'utf8');
    const configured = eslint.match(/const featureNames = \[([\s\S]*?)\];/)?.[1]
        .match(/"([^"]+)"/g)
        ?.map(value => value.slice(1, -1))
        .sort();
    assert.deepEqual(configured, features, 'eslint.config.mjs must list every feature directory.');

    const areas = JSON.parse(await readFile(path.join(root, '.upgrades/areas.json'), 'utf8'));
    assert.deepEqual(areas.filter(area => !area.includes('.') && area !== 'site' && area !== 'tooling').sort(), features);
});
