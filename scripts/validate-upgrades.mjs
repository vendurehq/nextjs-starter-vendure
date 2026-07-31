#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {
    gitOutput,
    listReleaseVersions,
    readJson,
    readStorefrontConfig,
    readUpgradeNotes,
    renderReleaseGuide,
    validateUpgradeManifest,
} from './lib/upgrade-protocol.mjs';

const root = process.cwd();

const impactfulFiles = new Set([
    '.env.example',
    '.gitignore',
    'components.json',
    'eslint.config.mjs',
    'graphql.config.yml',
    'next.config.ts',
    'package-lock.json',
    'package.json',
    'postcss.config.mjs',
    'tsconfig.json',
]);

function isImpactful(file) {
    return [
        '.github/',
        'public/',
        'schemas/',
        'scripts/',
        'src/',
        'tests/',
    ].some(prefix => file.startsWith(prefix)) ||
        file === '.upgrades/areas.json' ||
        impactfulFiles.has(file);
}

function areaFor(file) {
    const feature = file.match(/^src\/features\/([^/]+)\//)?.[1];
    if (feature) return feature;
    if (file.startsWith('src/platform/i18n/')) return 'platform.i18n';
    if (file.startsWith('src/platform/next/')) return 'platform.next';
    if (file.startsWith('src/platform/vendure/') || file.startsWith('src/platform/revalidation/')) return 'platform.vendure';
    if (file.startsWith('src/site/') || file.startsWith('src/config/')) return 'site';
    return 'tooling';
}

try {
    await readStorefrontConfig(root);
    const {notes, exemptionFiles} = await readUpgradeNotes(root);
    const baseIndex = process.argv.indexOf('--base');
    if (baseIndex !== -1) {
        const base = process.argv[baseIndex + 1];
        if (!base) throw new Error('--base requires a Git ref.');
        const changes = gitOutput(root, ['diff', '--name-status', `${base}...HEAD`])
            .split('\n')
            .filter(Boolean)
            .map(line => {
                const [status, ...paths] = line.split('\t');
                return {status, paths, file: paths.at(-1)};
            });
        const impactful = [...new Set(changes.flatMap(change => change.paths).filter(isImpactful))];
        const addedNotes = changes.filter(({status, file}) =>
            status === 'A' &&
            file.startsWith('.upgrades/changes/') &&
            file.endsWith('.md') &&
            !file.endsWith('/README.md') &&
            !path.basename(file).startsWith('_')
        );
        const addedManifestFiles = changes
            .filter(({status, file}) =>
                status === 'A' && /^\.upgrades\/releases\/v\d+\.\d+\.\d+\/manifest\.json$/.test(file)
            )
            .map(({file}) => file);
        const addedManifestChanges = (await Promise.all(addedManifestFiles.map(async file => {
            const manifest = await readJson(path.join(root, file));
            await validateUpgradeManifest(root, manifest, file);
            return manifest.changes;
        }))).flat();
        const addedExemptions = addedNotes.filter(({file}) => file.endsWith('.none.md'));
        const addedUpgradeContext = addedNotes.length + addedManifestFiles.length;
        if (impactful.length && addedUpgradeContext === 0) {
            throw new Error(`Downstream-impacting files changed without an upgrade note, release manifest, or explicit .none.md exemption:\n${impactful.join('\n')}`);
        }
        if (impactful.length && addedExemptions.length === 0) {
            const addedNoteIds = new Set(addedNotes.map(({file}) => path.basename(file, '.md')));
            const declaredAreas = new Set([
                ...notes.filter(note => addedNoteIds.has(note.id)).flatMap(note => note.areas),
                ...addedManifestChanges.flatMap(change => change.areas),
            ]);
            const requiredAreas = [...new Set(impactful.map(areaFor))];
            const missingAreas = requiredAreas.filter(area => !declaredAreas.has(area));
            if (missingAreas.length) {
                throw new Error(`Added upgrade notes do not cover changed areas: ${missingAreas.join(', ')}.`);
            }
        }
    }
    const releasesDirectory = path.join(root, '.upgrades', 'releases');
    const releases = await listReleaseVersions(releasesDirectory);
    for (const version of releases) {
        const release = `v${version}`;
        const manifest = await readJson(path.join(releasesDirectory, release, 'manifest.json'));
        await validateUpgradeManifest(root, manifest, `${release}/manifest.json`);
        if (manifest.version !== version) {
            throw new Error(`${release}/manifest.json does not match its release directory.`);
        }
        const guide = await readFile(path.join(releasesDirectory, release, 'guide.md'), 'utf8');
        if (guide !== renderReleaseGuide(manifest)) {
            throw new Error(`${release}/guide.md does not match its manifest.`);
        }
    }
    console.log(`Validated ${notes.length} pending upgrade note(s), ${exemptionFiles.length} exemption(s), and ${releases.length} release manifest(s).`);
} catch (error) {
    console.error(`Upgrade metadata validation failed: ${error.message}`);
    process.exitCode = 1;
}
