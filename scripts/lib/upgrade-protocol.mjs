import {createHash} from 'node:crypto';
import {execFileSync, spawnSync} from 'node:child_process';
import {
    copyFile,
    mkdir,
    readFile,
    readdir,
    rename,
    rm,
    stat,
    writeFile,
} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {parse as parseYaml} from 'yaml';
import * as tar from 'tar';

export const MANAGED_BASELINE_VERSION = '1.0.0';
export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
export const REQUIRED_NOTE_SECTIONS = [
    'Intent',
    'Invariants',
    'Integration guidance',
    'Verification',
];
export const REQUIRED_REPORT_SECTIONS = [
    'Integrated upstream changes',
    'Preserved customizations',
    'Deviations and deferred changes',
    'Verification',
];

export function normalizeVersion(value) {
    const version = value?.replace(/^v/, '');
    if (!version || !VERSION_PATTERN.test(version)) {
        throw new Error(`Expected a release version such as 1.2.0 (prereleases are not supported); received "${value ?? ''}".`);
    }
    return version;
}

export function compareVersions(left, right) {
    const a = normalizeVersion(left).split('.').map(Number);
    const b = normalizeVersion(right).split('.').map(Number);
    for (let index = 0; index < 3; index += 1) {
        if (a[index] !== b[index]) return a[index] - b[index];
    }
    return 0;
}

export async function readJson(file) {
    return JSON.parse(await readFile(file, 'utf8'));
}

export async function writeJson(file, value) {
    await mkdir(path.dirname(file), {recursive: true});
    const temporary = `${file}.tmp`;
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
    await rename(temporary, file);
}

export function gitOutput(root, args, options = {}) {
    return execFileSync('git', args, {
        cwd: root,
        encoding: 'utf8',
        maxBuffer: 100 * 1024 * 1024,
        ...options,
    }).trim();
}

export function assertGitRepository(root) {
    if (gitOutput(root, ['rev-parse', '--is-inside-work-tree']) !== 'true') {
        throw new Error('Storefront upgrades must run inside a Git worktree.');
    }
}

export function assertCleanWorktree(root) {
    const status = gitOutput(root, ['status', '--porcelain=v1', '--untracked-files=all']);
    if (status) {
        throw new Error('The Git worktree must be clean before preparing or initializing an upgrade. Commit or stash unrelated changes first.');
    }
}

export async function readStorefrontConfig(root) {
    const file = path.join(root, '.vendure', 'storefront.json');
    const config = await readJson(file);
    normalizeVersion(config.version);
    if (!config.upstream || !Array.isArray(config.verification) || config.verification.length === 0) {
        throw new Error(`${path.relative(root, file)} is missing upstream or verification configuration.`);
    }
    return {config, file};
}

export function fetchRelease(root, upstream, version) {
    const normalized = normalizeVersion(version);
    execFileSync('git', [
        'fetch',
        '--quiet',
        '--no-tags',
        upstream,
        `refs/tags/v${normalized}`,
    ], {cwd: root, stdio: 'inherit'});
    return {commit: gitOutput(root, ['rev-parse', 'FETCH_HEAD^{commit}'])};
}

async function extractRef(root, ref, destination) {
    await mkdir(destination, {recursive: true});
    const archive = path.join(path.dirname(destination), `${path.basename(destination)}.tar`);
    execFileSync('git', ['archive', '--format=tar', '--output', archive, ref], {cwd: root});
    await tar.x({file: archive, cwd: destination});
    await rm(archive);
}

async function listReleaseVersions(targetSnapshot) {
    const releases = path.join(targetSnapshot, '.upgrades', 'releases');
    let entries;
    try {
        entries = await readdir(releases, {withFileTypes: true});
    } catch {
        return [];
    }
    return entries
        .filter(entry => entry.isDirectory() && VERSION_PATTERN.test(entry.name.replace(/^v/, '')))
        .map(entry => entry.name.replace(/^v/, ''))
        .sort(compareVersions);
}

async function copyReleaseContext(targetSnapshot, contextDirectory, fromVersion, targetVersion, legacy) {
    const versions = (await listReleaseVersions(targetSnapshot)).filter(version =>
        compareVersions(version, targetVersion) <= 0 &&
        (legacy || compareVersions(version, fromVersion) > 0)
    );
    const releasesDirectory = path.join(contextDirectory, 'releases');
    await mkdir(releasesDirectory, {recursive: true});

    const guides = [];
    for (const version of versions) {
        const source = path.join(targetSnapshot, '.upgrades', 'releases', `v${version}`);
        const destination = path.join(releasesDirectory, `v${version}`);
        await mkdir(destination, {recursive: true});
        for (const filename of ['manifest.json', 'guide.md']) {
            const sourceFile = path.join(source, filename);
            try {
                await copyFile(sourceFile, path.join(destination, filename));
            } catch {
                throw new Error(`Release v${version} is missing ${filename}.`);
            }
        }
        guides.push(await readFile(path.join(source, 'guide.md'), 'utf8'));
    }
    await writeFile(path.join(contextDirectory, 'release-guides.md'), `${guides.join('\n\n---\n\n')}\n`);
    return versions;
}

function makeBrief({fromVersion, targetVersion, legacy, versions, reportPath}) {
    const comparison = legacy
        ? 'This is a best-effort two-way onboarding. No trustworthy historical upstream baseline is available.'
        : `Use baseline/ as the old upstream source, the current storefront as downstream intent, and target/ as the new upstream source.`;
    return `# Storefront upgrade integration brief

Upgrade this customized storefront from ${legacy ? 'an unmanaged legacy version' : `v${fromVersion}`} to v${targetVersion}.

## Authority

Downstream intent wins by default. Preserve customized behavior and presentation while integrating each upstream change's intent and invariants. Surface irreconcilable tradeoffs; never silently discard downstream work.

## Comparison model

${comparison}

- Review \`release-guides.md\` before editing source.
- Use \`upstream.patch\` as a navigation aid, not as authority to overwrite local files.
- Release sequence: ${versions.length ? versions.map(version => `v${version}`).join(' → ') : 'no release metadata found'}.
- Apply release-provided codemods only after reviewing their scope.

## Completion

1. Integrate the upstream intent into developer-owned source.
2. Create \`${reportPath}\` with these headings:
${REQUIRED_REPORT_SECTIONS.map(section => `   - \`${section}\``).join('\n')}
3. Run \`npm run upgrade:verify\`.
4. Run \`npm run upgrade:finalize\` only after verification passes.
5. Commit the source changes, report, and provenance update together.
`;
}

export async function initializeStorefront(root) {
    assertGitRepository(root);
    assertCleanWorktree(root);
    const {config, file} = await readStorefrontConfig(root);
    if (config.commit) throw new Error(`Storefront provenance is already initialized at ${config.commit}.`);
    const release = fetchRelease(root, config.upstream, config.version);
    config.commit = release.commit;
    await writeJson(file, config);
    return release;
}

export async function prepareUpgrade(root, requestedVersion, {legacy = false} = {}) {
    assertGitRepository(root);
    assertCleanWorktree(root);
    const {config} = await readStorefrontConfig(root);
    const targetVersion = normalizeVersion(requestedVersion);
    if (legacy && config.commit) throw new Error('Legacy preparation is only valid before storefront provenance has been initialized.');
    if (!legacy && !config.commit) throw new Error('Storefront provenance is not initialized. Use upgrade:init for a new baseline or --legacy for an older fork.');
    if (legacy && targetVersion !== MANAGED_BASELINE_VERSION) {
        throw new Error(`Legacy storefronts must first onboard to v${MANAGED_BASELINE_VERSION}.`);
    }
    if (!legacy && compareVersions(targetVersion, config.version) <= 0) {
        throw new Error(`Target v${targetVersion} must be newer than the current v${config.version}.`);
    }

    const baseDirectory = path.join(root, '.vendure', 'upgrade-workspace');
    try {
        const existing = await readdir(baseDirectory);
        if (existing.length) throw new Error('An upgrade workspace already exists. Finalize or remove it before preparing another upgrade.');
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }

    const target = fetchRelease(root, config.upstream, targetVersion);
    const fromVersion = legacy ? 'legacy' : config.version;
    const contextDirectory = path.join(baseDirectory, `${fromVersion}-to-${targetVersion}`);
    const targetSnapshot = path.join(contextDirectory, 'target');
    await mkdir(contextDirectory, {recursive: true});
    await extractRef(root, target.commit, targetSnapshot);

    let baselineCommit = null;
    if (!legacy) {
        const baseline = fetchRelease(root, config.upstream, config.version);
        if (baseline.commit !== config.commit) {
            throw new Error(`The recorded v${config.version} commit does not match the upstream tag. Refusing an ambiguous baseline.`);
        }
        baselineCommit = baseline.commit;
        await extractRef(root, baseline.commit, path.join(contextDirectory, 'baseline'));
    }

    const patch = execFileSync('git', [
        'diff',
        '--binary',
        legacy ? 'HEAD' : baselineCommit,
        target.commit,
        '--',
        '.',
        ':(exclude).vendure/storefront.json',
    ], {cwd: root, maxBuffer: 100 * 1024 * 1024});
    await writeFile(path.join(contextDirectory, 'upstream.patch'), patch);

    const versions = await copyReleaseContext(targetSnapshot, contextDirectory, config.version, targetVersion, legacy);
    const reportPath = `.vendure/upgrade-reports/${legacy ? 'legacy' : `v${config.version}`}-to-v${targetVersion}.md`;
    await writeFile(path.join(contextDirectory, 'INTEGRATION.md'), makeBrief({
        fromVersion: config.version,
        targetVersion,
        legacy,
        versions,
        reportPath,
    }));
    await writeJson(path.join(contextDirectory, 'state.json'), {
        fromVersion: legacy ? null : config.version,
        baselineCommit,
        targetVersion,
        targetCommit: target.commit,
        legacy,
        reportPath,
        preparedAt: new Date().toISOString(),
        verifiedFingerprint: null,
        verifiedAt: null,
    });
    return {contextDirectory, targetVersion, targetCommit: target.commit, reportPath};
}

export async function findUpgradeContext(root) {
    const base = path.join(root, '.vendure', 'upgrade-workspace');
    let entries;
    try {
        entries = (await readdir(base, {withFileTypes: true})).filter(entry => entry.isDirectory());
    } catch {
        throw new Error('No prepared upgrade workspace found. Run upgrade:prepare first.');
    }
    if (entries.length !== 1) throw new Error('Expected exactly one prepared upgrade workspace.');
    const directory = path.join(base, entries[0].name);
    return {directory, state: await readJson(path.join(directory, 'state.json'))};
}

export function worktreeFingerprint(root) {
    const hash = createHash('sha256');
    hash.update(gitOutput(root, ['rev-parse', 'HEAD']));
    hash.update(execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {cwd: root}));
    hash.update(execFileSync('git', ['diff', '--binary', 'HEAD'], {cwd: root, maxBuffer: 100 * 1024 * 1024}));
    hash.update(execFileSync('git', ['diff', '--binary', '--cached', 'HEAD'], {cwd: root, maxBuffer: 100 * 1024 * 1024}));
    const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {cwd: root})
        .toString('utf8').split('\0').filter(Boolean).sort();
    for (const relativeFile of untracked) {
        hash.update(relativeFile);
        hash.update(readFileSync(path.join(root, relativeFile)));
    }
    return hash.digest('hex');
}

export async function verifyUpgrade(root) {
    const {config} = await readStorefrontConfig(root);
    const context = await findUpgradeContext(root);
    const reportFile = path.join(root, context.state.reportPath);
    await validateUpgradeReport(reportFile);

    for (const command of config.verification) {
        const result = spawnSync(command, {cwd: root, shell: true, stdio: 'inherit'});
        if (result.status !== 0) throw new Error(`Verification failed: ${command}`);
    }
    context.state.verifiedFingerprint = worktreeFingerprint(root);
    context.state.verifiedAt = new Date().toISOString();
    await writeJson(path.join(context.directory, 'state.json'), context.state);
    return context.state;
}

export async function finalizeUpgrade(root) {
    const {config, file} = await readStorefrontConfig(root);
    const context = await findUpgradeContext(root);
    if (!context.state.verifiedFingerprint) throw new Error('Upgrade verification has not completed successfully.');
    if (worktreeFingerprint(root) !== context.state.verifiedFingerprint) {
        throw new Error('The storefront changed after verification. Run upgrade:verify again.');
    }
    await validateUpgradeReport(path.join(root, context.state.reportPath));
    config.version = context.state.targetVersion;
    config.commit = context.state.targetCommit;
    await writeJson(file, config);
    await rm(path.join(root, '.vendure', 'upgrade-workspace'), {recursive: true});
    return config;
}

export async function validateUpgradeReport(file) {
    let content;
    try {
        content = await readFile(file, 'utf8');
    } catch {
        throw new Error(`Create the required upgrade report at ${file} before verification.`);
    }
    for (const section of REQUIRED_REPORT_SECTIONS) {
        if (!new RegExp(`^## ${section}$`, 'm').test(content)) {
            throw new Error(`Upgrade report is missing the "## ${section}" section.`);
        }
    }
}

export function parseUpgradeNote(content, id, allowedAreas) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`${id}: expected YAML frontmatter delimited by ---.`);
    const metadata = parseYaml(match[1]);
    if (!['patch', 'minor', 'major'].includes(metadata?.type)) {
        throw new Error(`${id}: type must be patch, minor, or major.`);
    }
    if (!Array.isArray(metadata.areas) || metadata.areas.length === 0) {
        throw new Error(`${id}: areas must contain at least one module identifier.`);
    }
    for (const area of metadata.areas) {
        if (!allowedAreas.includes(area)) throw new Error(`${id}: unknown area "${area}".`);
    }
    if (typeof metadata.breaking !== 'boolean') throw new Error(`${id}: breaking must be true or false.`);
    if (metadata.breaking && metadata.type !== 'major') {
        throw new Error(`${id}: breaking changes must use type: major.`);
    }
    for (const section of REQUIRED_NOTE_SECTIONS) {
        if (!new RegExp(`^## ${section}$`, 'm').test(match[2])) {
            throw new Error(`${id}: missing "## ${section}" section.`);
        }
    }
    return {id, type: metadata.type, areas: metadata.areas, breaking: metadata.breaking, content: match[2].trim()};
}

export async function readUpgradeNotes(root) {
    const allowedAreas = await readJson(path.join(root, '.upgrades', 'areas.json'));
    const directory = path.join(root, '.upgrades', 'changes');
    const authoredFiles = (await readdir(directory))
        .filter(file => file.endsWith('.md') && file !== 'README.md' && !file.startsWith('_'))
        .sort();
    const files = authoredFiles.filter(file => !file.endsWith('.none.md'));
    const exemptionFiles = authoredFiles.filter(file => file.endsWith('.none.md'));
    const notes = [];
    for (const file of files) {
        notes.push(parseUpgradeNote(await readFile(path.join(directory, file), 'utf8'), file.replace(/\.md$/, ''), allowedAreas));
    }
    for (const file of exemptionFiles) {
        const content = await readFile(path.join(directory, file), 'utf8');
        if (!/^# No downstream impact$/m.test(content) || !/^## Reason\s*\n\s*\S/m.test(content)) {
            throw new Error(`${file}: exemptions require "# No downstream impact" and a non-empty "## Reason" section.`);
        }
    }
    return {directory, files, exemptionFiles, notes};
}

export async function pathExists(file) {
    try {
        await stat(file);
        return true;
    } catch {
        return false;
    }
}
