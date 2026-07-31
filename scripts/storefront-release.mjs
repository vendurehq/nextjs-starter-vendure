#!/usr/bin/env node
import {mkdir, readdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {
    compareVersions,
    normalizeVersion,
    pathExists,
    readJson,
    readStorefrontConfig,
    readUpgradeNotes,
    writeJson,
} from './lib/upgrade-protocol.mjs';

const root = process.cwd();
const version = normalizeVersion(process.argv.slice(2).find(arg => !arg.startsWith('--')));
const initial = process.argv.includes('--initial');

try {
    const releasesDirectory = path.join(root, '.upgrades', 'releases');
    const destination = path.join(releasesDirectory, `v${version}`);
    if (await pathExists(destination)) throw new Error(`Release v${version} already exists.`);

    const existing = (await readdir(releasesDirectory, {withFileTypes: true}))
        .filter(entry => entry.isDirectory() && /^v\d+\.\d+\.\d+/.test(entry.name))
        .map(entry => entry.name.slice(1))
        .sort(compareVersions);
    const previousVersion = existing.at(-1) ?? null;
    if (initial !== (previousVersion === null)) {
        throw new Error(previousVersion ? 'Only the first managed release may use --initial.' : 'The first managed release requires --initial.');
    }
    if (previousVersion && compareVersions(version, previousVersion) <= 0) {
        throw new Error(`Release v${version} must be newer than v${previousVersion}.`);
    }

    const {directory: changesDirectory, files, exemptionFiles, notes} = await readUpgradeNotes(root);
    if (!initial && notes.length === 0) throw new Error('A non-initial release requires at least one upgrade note.');
    if (previousVersion) {
        const previousParts = previousVersion.split('.').map(Number);
        const nextParts = version.split('.').map(Number);
        const actualBump = nextParts[0] > previousParts[0]
            ? 'major'
            : nextParts[1] > previousParts[1]
                ? 'minor'
                : 'patch';
        const bumpRank = {patch: 0, minor: 1, major: 2};
        const requiredBump = notes.reduce(
            (highest, note) => bumpRank[note.type] > bumpRank[highest] ? note.type : highest,
            'patch',
        );
        if (bumpRank[actualBump] < bumpRank[requiredBump]) {
            throw new Error(`Upgrade notes require a ${requiredBump} release, but v${version} is a ${actualBump} bump.`);
        }
    }

    await mkdir(destination, {recursive: true});
    await writeJson(path.join(destination, 'manifest.json'), {
        $schema: '../../../schemas/upgrade-manifest.schema.json',
        version,
        previousVersion,
        initial,
        changes: notes,
    });

    const guide = [
        `# Vendure storefront v${version}`,
        '',
        previousVersion ? `Upgrade from v${previousVersion}.` : 'This is the first managed storefront baseline.',
        '',
        ...notes.flatMap(note => [
            `## ${note.id}`,
            '',
            `Type: ${note.type} · Areas: ${note.areas.join(', ')} · Breaking: ${note.breaking ? 'yes' : 'no'}`,
            '',
            note.content,
            '',
        ]),
    ].join('\n');
    await writeFile(path.join(destination, 'guide.md'), `${guide.trim()}\n`);

    for (const file of [...files, ...exemptionFiles]) await rm(path.join(changesDirectory, file));

    const packageFile = path.join(root, 'package.json');
    const packageJson = await readJson(packageFile);
    packageJson.version = version;
    await writeJson(packageFile, packageJson);

    const {config, file: configFile} = await readStorefrontConfig(root);
    config.version = version;
    config.commit = null;
    await writeJson(configFile, config);

    console.log(`Prepared release v${version}. Review and commit the generated artifacts before creating the immutable v${version} tag.`);
} catch (error) {
    console.error(`Storefront release failed: ${error.message}`);
    process.exitCode = 1;
}
