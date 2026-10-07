import assert from 'node:assert/strict';
import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const sourceRoot = path.join(root, 'src');
const appRoot = path.join(sourceRoot, 'app');
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

test('Next.js app files remain re-export shims', async () => {
    const violations = [];
    for (const file of await findSourceFiles(appRoot)) {
        const content = await readFile(file, 'utf8');
        const scriptKind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
        const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind);

        if (source.parseDiagnostics.length) {
            violations.push(`${path.relative(root, file)} could not be parsed`);
            continue;
        }

        let hasReExport = false;
        for (const statement of source.statements) {
            const isStylesheetImport = ts.isImportDeclaration(statement)
                && !statement.importClause
                && ts.isStringLiteral(statement.moduleSpecifier)
                && statement.moduleSpecifier.text.endsWith('.css');
            const isExplicitReExport = ts.isExportDeclaration(statement)
                && ts.isNamedExports(statement.exportClause)
                && statement.moduleSpecifier
                && ts.isStringLiteral(statement.moduleSpecifier);
            if (isExplicitReExport) hasReExport = true;
            if (!isStylesheetImport && !isExplicitReExport) {
                violations.push(`${path.relative(root, file)} contains behavior instead of only explicit re-exports`);
            }
        }
        if (!hasReExport) violations.push(`${path.relative(root, file)} does not explicitly re-export a route module`);
    }
    assert.deepEqual(violations, []);
});

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

const openRouterProvider = path.join(featuresRoot, 'ai-shopping-assistant', 'openrouter.ts');

function startsWithDirective(content, directive) {
    return new RegExp(`^(?:\\s|//[^\\n]*\\n|/\\*[\\s\\S]*?\\*/)*['"]${directive}['"]`).test(content);
}

function runtimeImports(file, content) {
    const scriptKind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const source = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind);
    const specifiers = [];
    const visit = node => {
        if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) {
            specifiers.push(node.moduleSpecifier.text);
        } else if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            specifiers.push(node.moduleSpecifier.text);
        } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) {
            specifiers.push(node.arguments[0].text);
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return specifiers;
}

test('the OpenRouter key and endpoint stay in the server-only provider module', async () => {
    const violations = [];
    for (const file of await findSourceFiles(sourceRoot)) {
        const content = await readFile(file, 'utf8');
        if (/NEXT_PUBLIC_OPENROUTER/.test(content)) {
            violations.push(`${path.relative(root, file)} exposes OpenRouter configuration to the browser`);
        }
        if (file !== openRouterProvider && /OPENROUTER_API_KEY|openrouter\.ai/.test(content)) {
            violations.push(`${path.relative(root, file)} references the OpenRouter key or endpoint outside the provider module`);
        }
    }
    if (startsWithDirective(await readFile(openRouterProvider, 'utf8'), 'use client')) {
        violations.push('the OpenRouter provider module must not be a client module');
    }

    const example = await readFile(path.join(root, '.env.example'), 'utf8');
    if (/NEXT_PUBLIC_OPENROUTER/.test(example)) violations.push('.env.example declares a public OpenRouter variable');
    if (!/^OPENROUTER_API_KEY=$/m.test(example)) violations.push('.env.example must declare OPENROUTER_API_KEY without a value');
    assert.deepEqual(violations, []);
});

test('client modules cannot import the OpenRouter provider, directly or transitively', async () => {
    const files = await findSourceFiles(sourceRoot);
    const known = new Set(files);
    const contents = new Map(await Promise.all(files.map(async file => [file, await readFile(file, 'utf8')])));
    const resolve = (from, specifier) => {
        const target = resolveImport(from, specifier);
        if (!target) return null;
        return [target, `${target}.ts`, `${target}.tsx`, path.join(target, 'index.ts'), path.join(target, 'index.tsx')]
            .find(candidate => known.has(candidate)) ?? null;
    };

    const violations = [];
    for (const client of files.filter(file => startsWithDirective(contents.get(file), 'use client'))) {
        const visited = new Set();
        const pending = [[client]];
        while (pending.length) {
            const chain = pending.pop();
            const file = chain.at(-1);
            if (visited.has(file)) continue;
            visited.add(file);
            if (file === openRouterProvider) {
                violations.push(chain.map(step => path.relative(root, step)).join(' -> '));
                continue;
            }
            // Server actions are referenced, not bundled, when a client module imports them.
            if (file !== client && startsWithDirective(contents.get(file), 'use server')) continue;
            for (const specifier of runtimeImports(file, contents.get(file))) {
                const target = resolve(file, specifier);
                if (target) pending.push([...chain, target]);
            }
        }
    }
    assert.deepEqual(violations, []);
});

test('storefront pages render the AI shopping assistant only through its opt-in section', async () => {
    const assistantRoot = path.join(featuresRoot, 'ai-shopping-assistant');
    const section = path.join(assistantRoot, 'shopping-assistant-section.tsx');
    const ungated = path.join(assistantRoot, 'shopping-assistant.tsx');
    const violations = [];

    for (const file of await findSourceFiles(sourceRoot)) {
        if (file.startsWith(`${assistantRoot}${path.sep}`)) continue;
        const content = await readFile(file, 'utf8');
        for (const specifier of runtimeImports(file, content)) {
            const target = resolveImport(file, specifier);
            if (target && [ungated, ungated.replace(/\.tsx$/, '')].includes(target)) {
                violations.push(`${path.relative(root, file)} renders the assistant without its configuration check`);
            }
        }
    }

    const content = await readFile(section, 'utf8');
    if (startsWithDirective(content, 'use client')) violations.push('the opt-in section must be a server component');
    if (!/isShoppingAssistantEnabled\(\)/.test(content)) violations.push('the opt-in section must check isShoppingAssistantEnabled()');
    assert.deepEqual(violations, []);
});
