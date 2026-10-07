import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {after, afterEach, before, beforeEach, mock, test} from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const featureRoot = path.join(root, 'src/features/ai-shopping-assistant');

let directory;
let runShoppingAssistant;
let logged;

before(async () => {
    // assistant-flow.ts imports only pure sibling modules at runtime; transpile them together
    // and point relative specifiers at the emitted .mjs files.
    directory = await mkdtemp(path.join(tmpdir(), 'assistant-flow-'));
    for (const name of ['intent', 'intent-extraction', 'assistant-flow']) {
        const source = path.join(featureRoot, `${name}.ts`);
        const {outputText} = ts.transpileModule(await readFile(source, 'utf8'), {
            fileName: source,
            compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
        });
        await writeFile(
            path.join(directory, `${name}.mjs`),
            outputText.replace(/(from\s+['"])(\.\/[^'"]+)(['"])/g, '$1$2.mjs$3'),
        );
    }
    ({runShoppingAssistant} = await import(pathToFileURL(path.join(directory, 'assistant-flow.mjs')).href));
});

beforeEach(() => {
    logged = mock.method(console, 'error', () => {});
});

afterEach(() => {
    logged.mock.restore();
});

after(async () => {
    await rm(directory, {recursive: true, force: true});
});

const options = {languageCode: 'en', currencyCode: 'USD'};
const collectionSlugs = ['electronics', 'sports-outdoor'];

const laptop = {
    productId: '1',
    name: 'Laptop',
    slug: 'laptop',
    description: 'Seventh-generation Intel Core processors.',
    imageUrl: 'https://cdn.test/laptop.jpg',
    priceWithTax: {min: 263880, max: 275880},
    currencyCode: 'USD',
    variants: [{id: '3', name: 'Laptop 13 inch 16GB', sku: 'L2201316', priceWithTax: 263880, options: [{group: 'RAM', value: '16GB'}]}],
};

const catalogResult = (candidates, extra = {}) => ({
    status: 'ok',
    candidates,
    appliedAttributes: [],
    unverifiedAttributes: [],
    truncated: false,
    ...extra,
});

/** A model answer in the shape the intent schema requires. */
const answer = fields => ({
    ok: true,
    content: JSON.stringify({
        query: null,
        minPrice: null,
        maxPrice: null,
        currency: null,
        collectionSlug: null,
        attributes: [],
        sort: null,
        ...fields,
    }),
});

function fakeDependencies({completion = answer({query: 'laptop'}), slugs = collectionSlugs, catalog = catalogResult([])} = {}) {
    const calls = {complete: [], load: [], search: []};
    return {
        calls,
        dependencies: {
            completeStructured: async request => {
                calls.complete.push(request);
                return completion;
            },
            loadCollectionSlugs: async languageCode => {
                calls.load.push(languageCode);
                if (slugs instanceof Error) throw slugs;
                return slugs;
            },
            searchCatalog: async (intent, searchOptions) => {
                calls.search.push({intent, options: searchOptions});
                return catalog;
            },
        },
    };
}

test('extracts, validates and answers a request with the products the catalog returned', async () => {
    const applied = [{name: 'ram', value: '16gb'}];
    const catalog = catalogResult([laptop], {appliedAttributes: applied});
    const {calls, dependencies} = fakeDependencies({
        catalog,
        completion: answer({
            query: 'laptop',
            maxPrice: 3000,
            currency: 'USD',
            collectionSlug: 'electronics',
            attributes: [{name: 'RAM', value: '16GB'}],
        }),
    });

    const result = await runShoppingAssistant('  I need a laptop \n with 16GB RAM under $3000 ', options, dependencies);

    const intent = {query: 'laptop', maxPrice: 300000, collectionSlug: 'electronics', attributes: applied};
    assert.deepEqual(result, {...catalog, intent, notices: []});
    assert.equal(result.candidates[0], laptop, 'candidates are passed through from the catalog, not rebuilt');

    assert.deepEqual(calls.load, ['en']);
    assert.equal(calls.complete.length, 1);
    assert.equal(calls.complete[0].messages.at(-1).content, 'I need a laptop with 16GB RAM under $3000');
    assert.deepEqual(calls.complete[0].schema.properties.collectionSlug.enum, [...collectionSlugs, null]);
    assert.deepEqual(calls.search, [{intent, options}]);
});

test('returns zero candidates when the catalog has no match', async () => {
    const {calls, dependencies} = fakeDependencies({
        completion: answer({query: 'laptop', maxPrice: 1500, attributes: [{name: 'ram', value: '16gb'}]}),
        catalog: catalogResult([]),
    });

    const result = await runShoppingAssistant('laptop with 16GB RAM under $1500', options, dependencies);

    assert.equal(result.status, 'ok');
    assert.deepEqual(result.candidates, []);
    assert.equal(calls.search.length, 1);
});

test('never searches the catalog with malformed or invalid model output', async () => {
    const outputs = [
        {ok: true, content: 'Here are three great laptops: ...'},
        {ok: true, content: '{"query": "lap'},
        {ok: true, content: '[{"productName": "Laptop Pro"}]'},
        answer({collectionSlug: 'laptops'}),
        answer({query: 42}),
        answer({maxPrice: -10}),
        answer({minPrice: 2000, maxPrice: 1000}),
        answer({sort: {by: 'rating', order: 'DESC'}}),
        answer({attributes: [{name: 'ram'}]}),
    ];
    for (const completion of outputs) {
        const {calls, dependencies} = fakeDependencies({completion});
        assert.deepEqual(
            await runShoppingAssistant('a laptop', options, dependencies),
            {status: 'unavailable', reason: 'invalid_output'},
            completion.content,
        );
        assert.equal(calls.search.length, 0, completion.content);
    }
    for (const call of logged.mock.calls) {
        assert.doesNotMatch(call.arguments.map(String).join(' '), /a laptop|Laptop Pro|three great/);
    }
});

test('never searches the catalog when the provider fails', async () => {
    for (const reason of ['provider_error', 'rate_limited', 'not_configured', 'invalid_output']) {
        const {calls, dependencies} = fakeDependencies({completion: {ok: false, reason}});
        assert.deepEqual(await runShoppingAssistant('a laptop', options, dependencies), {status: 'unavailable', reason});
        assert.equal(calls.search.length, 0, reason);
    }
});

test('never searches the catalog when the provider times out', async () => {
    const {calls, dependencies} = fakeDependencies({completion: {ok: false, reason: 'timeout'}});

    assert.deepEqual(await runShoppingAssistant('a laptop', options, dependencies), {status: 'unavailable', reason: 'timeout'});
    assert.equal(calls.search.length, 0);
});

test('never searches the catalog for a request without criteria', async () => {
    const {calls, dependencies} = fakeDependencies({completion: answer({})});

    assert.deepEqual(await runShoppingAssistant('hello, how are you?', options, dependencies), {status: 'no_criteria', notices: []});
    assert.equal(calls.search.length, 0);
});

test('never searches the catalog with an invalid currency', async () => {
    const {calls, dependencies} = fakeDependencies({completion: answer({query: 'shoes', maxPrice: 100, currency: 'dollars'})});

    assert.deepEqual(await runShoppingAssistant('shoes under 100 dollars', options, dependencies), {status: 'unavailable', reason: 'invalid_output'});
    assert.equal(calls.search.length, 0);
});

test('never searches the catalog when a foreign-currency price was the only criterion', async () => {
    const {calls, dependencies} = fakeDependencies({completion: answer({maxPrice: 100, currency: 'EUR'})});

    assert.deepEqual(await runShoppingAssistant('anything under 100 €', options, dependencies), {
        status: 'no_criteria',
        notices: [{type: 'currency_mismatch', requested: 'EUR', active: 'USD'}],
    });
    assert.equal(calls.search.length, 0);
});

test('searches remaining criteria without a foreign-currency price and reports the mismatch', async () => {
    const {calls, dependencies} = fakeDependencies({completion: answer({query: 'shoes', maxPrice: 100, currency: 'EUR'})});

    const result = await runShoppingAssistant('shoes under 100 €', options, dependencies);

    assert.deepEqual(calls.search, [{intent: {query: 'shoes'}, options}]);
    assert.deepEqual(result.notices, [{type: 'currency_mismatch', requested: 'EUR', active: 'USD'}]);
    assert.deepEqual(result.intent, {query: 'shoes'});
});

test('rejects empty and oversized requests before calling any dependency', async () => {
    for (const text of ['   ', 'a'.repeat(501)]) {
        const {calls, dependencies} = fakeDependencies();
        assert.deepEqual(await runShoppingAssistant(text, options, dependencies), {status: 'invalid_request'});
        assert.deepEqual([calls.load.length, calls.complete.length, calls.search.length], [0, 0, 0]);
    }
});

test('reports catalog failures without calling the provider when collections cannot load', async () => {
    const {calls, dependencies} = fakeDependencies({slugs: new Error('Vendure is down')});

    assert.deepEqual(await runShoppingAssistant('a laptop', options, dependencies), {status: 'unavailable', reason: 'catalog_error'});
    assert.deepEqual([calls.complete.length, calls.search.length], [0, 0]);
});

test('reports catalog search failures', async () => {
    const {dependencies} = fakeDependencies({catalog: {status: 'error'}});

    assert.deepEqual(await runShoppingAssistant('a laptop', options, dependencies), {status: 'unavailable', reason: 'catalog_error'});
});
