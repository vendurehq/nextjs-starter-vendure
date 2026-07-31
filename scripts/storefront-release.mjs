#!/usr/bin/env node
import {mkdir, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {
    assertCleanWorktree,
    assertGitRepository,
    compareVersions,
    listReleaseVersions,
    normalizeVersion,
    pathExists,
    readJson,
    readStorefrontConfig,
    readUpgradeNotes,
    renderReleaseGuide,
    validateUpgradeManifest,
    writeJson,
} from './lib/upgrade-protocol.mjs';

const root = process.cwd();
const version = normalizeVersion(process.argv.slice(2).find(arg => !arg.startsWith('--')));
const initial = process.argv.includes('--initial');

try {
    assertGitRepository(root);
    assertCleanWorktree(root);
    const {config, file: configFile} = await readStorefrontConfig(root);
    const packageFile = path.join(root, 'package.json');
    const packageJson = await readJson(packageFile);
    const releasesDirectory = path.join(root, '.upgrades', 'releases');
    const destination = path.join(releasesDirectory, `v${version}`);
    if (await pathExists(destination)) throw new Error(`Release v${version} already exists.`);

    const existing = await listReleaseVersions(releasesDirectory);
    const previousVersion = existing.at(-1) ?? null;
    if (!previousVersion && !initial) throw new Error('The first managed release requires --initial.');
    if (previousVersion && initial) throw new Error('Only the first managed release may use --initial.');
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

    const manifest = {
        $schema: '../../../schemas/upgrade-manifest.schema.json',
        version,
        previousVersion,
        initial,
        changes: notes,
    };
    await validateUpgradeManifest(root, manifest, `release v${version} manifest`);

    await mkdir(destination, {recursive: true});
    await writeJson(path.join(destination, 'manifest.json'), manifest);
    await writeFile(path.join(destination, 'guide.md'), renderReleaseGuide(manifest));

    packageJson.version = version;
    await writeJson(packageFile, packageJson);

    config.version = version;
    config.commit = null;
    await writeJson(configFile, config);

    for (const file of [...files, ...exemptionFiles]) await rm(path.join(changesDirectory, file));

    console.log(`Prepared release v${version}. Review and commit the generated artifacts before creating the immutable v${version} tag.`);
} catch (error) {
    console.error(`Storefront release failed: ${error.message}`);
    process.exitCode = 1;
}
