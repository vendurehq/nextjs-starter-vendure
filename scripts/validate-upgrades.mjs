#!/usr/bin/env node
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {
    gitOutput,
    normalizeVersion,
    readJson,
    readStorefrontConfig,
    readUpgradeNotes,
} from './lib/upgrade-protocol.mjs';

const root = process.cwd();

try {
    await readStorefrontConfig(root);
    const {notes, exemptionFiles} = await readUpgradeNotes(root);
    const baseIndex = process.argv.indexOf('--base');
    if (baseIndex !== -1) {
        const base = process.argv[baseIndex + 1];
        if (!base) throw new Error('--base requires a Git ref.');
        const changed = gitOutput(root, ['diff', '--name-only', `${base}...HEAD`]).split('\n').filter(Boolean);
        const impactful = changed.filter(file =>
            file.startsWith('src/') ||
            file.startsWith('scripts/') ||
            file.startsWith('schemas/') ||
            file === 'package.json' ||
            file === 'package-lock.json' ||
            file === 'next.config.ts' ||
            file === 'tsconfig.json'
        );
        const changedNotes = changed.filter(file =>
            file.startsWith('.upgrades/changes/') &&
            file.endsWith('.md') &&
            !file.endsWith('/README.md') &&
            !path.basename(file).startsWith('_')
        );
        if (impactful.length && changedNotes.length === 0) {
            throw new Error(`Downstream-impacting files changed without an upgrade note or explicit .none.md exemption:\n${impactful.join('\n')}`);
        }
    }
    const releasesDirectory = path.join(root, '.upgrades', 'releases');
    const releases = (await readdir(releasesDirectory, {withFileTypes: true})).filter(entry => entry.isDirectory());
    for (const release of releases) {
        const version = normalizeVersion(release.name);
        const manifest = await readJson(path.join(releasesDirectory, release.name, 'manifest.json'));
        if (manifest.version !== version || !Array.isArray(manifest.changes)) {
            throw new Error(`${release.name}/manifest.json does not match its release directory.`);
        }
        const guide = await readFile(path.join(releasesDirectory, release.name, 'guide.md'), 'utf8');
        if (!guide.startsWith(`# Vendure storefront v${version}`)) {
            throw new Error(`${release.name}/guide.md has an invalid title.`);
        }
    }
    console.log(`Validated ${notes.length} pending upgrade note(s), ${exemptionFiles.length} exemption(s), and ${releases.length} release manifest(s).`);
} catch (error) {
    console.error(`Upgrade metadata validation failed: ${error.message}`);
    process.exitCode = 1;
}
