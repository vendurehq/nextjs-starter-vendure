import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {after, before, test} from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const source = path.join(root, 'src/features/ai-shopping-assistant/rate-limit.ts');

let directory;
let createRateLimiter;

before(async () => {
    // rate-limit.ts has no imports, so it can be transpiled and loaded on its own.
    const {outputText} = ts.transpileModule(await readFile(source, 'utf8'), {
        fileName: source,
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
    });
    directory = await mkdtemp(path.join(tmpdir(), 'rate-limit-'));
    const file = path.join(directory, 'rate-limit.mjs');
    await writeFile(file, outputText);
    ({createRateLimiter} = await import(pathToFileURL(file).href));
});

after(async () => {
    await rm(directory, {recursive: true, force: true});
});

test('allows requests up to the limit within a window', () => {
    let time = 1_000;
    const allow = createRateLimiter({limit: 3, windowMs: 60_000, now: () => time});

    assert.deepEqual([allow(), allow(), allow(), allow()], [true, true, true, false]);
    time += 59_999;
    assert.equal(allow(), false);
});

test('starts a new window after the window elapses', () => {
    let time = 0;
    const allow = createRateLimiter({limit: 1, windowMs: 60_000, now: () => time});

    assert.equal(allow(), true);
    assert.equal(allow(), false);
    time = 60_000;
    assert.equal(allow(), true);
    assert.equal(allow(), false);
});

test('keeps separate limiters independent', () => {
    const first = createRateLimiter({limit: 1, windowMs: 60_000, now: () => 0});
    const second = createRateLimiter({limit: 1, windowMs: 60_000, now: () => 0});

    assert.equal(first(), true);
    assert.equal(first(), false);
    assert.equal(second(), true);
});
