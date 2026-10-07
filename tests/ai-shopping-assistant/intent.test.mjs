import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {after, before, test} from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const source = path.join(root, 'src/features/ai-shopping-assistant/intent.ts');

let directory;
let parseShoppingIntent;

before(async () => {
    // intent.ts has only type imports, so it can be transpiled and loaded on its own.
    const {outputText} = ts.transpileModule(await readFile(source, 'utf8'), {
        fileName: source,
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
    });
    directory = await mkdtemp(path.join(tmpdir(), 'shopping-intent-'));
    const file = path.join(directory, 'intent.mjs');
    await writeFile(file, outputText);
    ({parseShoppingIntent} = await import(pathToFileURL(file).href));
});

after(async () => {
    await rm(directory, {recursive: true, force: true});
});

test('normalizes a complete intent', () => {
    const result = parseShoppingIntent({
        query: '  laptop \n for  work ',
        minPrice: 0,
        maxPrice: 150000,
        collectionSlug: ' Computers ',
        attributes: [
            {name: ' RAM ', value: '16GB'},
            {name: 'ram', value: '16gb'},
            {name: 'Screen Size', value: '13  inch'},
        ],
        sort: {by: 'Price', order: 'asc'},
        productIds: ['1'],
    });

    assert.deepEqual(result, {
        success: true,
        intent: {
            query: 'laptop for work',
            minPrice: 0,
            maxPrice: 150000,
            collectionSlug: 'computers',
            attributes: [
                {name: 'ram', value: '16gb'},
                {name: 'screen size', value: '13 inch'},
            ],
            sort: {by: 'price', order: 'ASC'},
        },
    });
});

test('treats null and blank values as absent', () => {
    assert.deepEqual(parseShoppingIntent({
        query: '   ',
        minPrice: null,
        maxPrice: null,
        collectionSlug: null,
        attributes: [],
        sort: null,
    }), {success: true, intent: {}});
});

test('rejects non-object input', () => {
    for (const input of [null, undefined, 'laptop', 42, []]) {
        assert.deepEqual(parseShoppingIntent(input), {
            success: false,
            issues: [{path: '', message: 'Expected an object.'}],
        });
    }
});

test('rejects invalid prices and inverted ranges', () => {
    const paths = input => parseShoppingIntent(input).issues?.map(issue => issue.path);

    assert.deepEqual(paths({minPrice: -1}), ['minPrice']);
    assert.deepEqual(paths({maxPrice: 1500.5}), ['maxPrice']);
    assert.deepEqual(paths({maxPrice: '1500'}), ['maxPrice']);
    assert.deepEqual(paths({maxPrice: Number.POSITIVE_INFINITY}), ['maxPrice']);
    assert.deepEqual(paths({minPrice: 200000, maxPrice: 150000}), ['maxPrice']);
});

test('rejects malformed text fields', () => {
    const paths = input => parseShoppingIntent(input).issues?.map(issue => issue.path);

    assert.deepEqual(paths({query: 42}), ['query']);
    assert.deepEqual(paths({query: 'a'.repeat(201)}), ['query']);
    assert.deepEqual(paths({collectionSlug: 'home garden'}), ['collectionSlug']);
});

test('rejects malformed attributes', () => {
    const paths = input => parseShoppingIntent(input).issues?.map(issue => issue.path);

    assert.deepEqual(paths({attributes: 'ram'}), ['attributes']);
    assert.deepEqual(paths({attributes: Array.from({length: 11}, (_, i) => ({name: 'tag', value: String(i)}))}), ['attributes']);
    assert.deepEqual(paths({attributes: ['16gb']}), ['attributes.0']);
    assert.deepEqual(paths({attributes: [{name: 'ram', value: ' '}]}), ['attributes.0.value']);
});

test('rejects unsupported sort preferences', () => {
    const paths = input => parseShoppingIntent(input).issues?.map(issue => issue.path);

    assert.deepEqual(paths({sort: 'price-asc'}), ['sort']);
    assert.deepEqual(paths({sort: {by: 'rating', order: 'ASC'}}), ['sort.by']);
    assert.deepEqual(paths({sort: {by: 'price', order: 'up'}}), ['sort.order']);
});
