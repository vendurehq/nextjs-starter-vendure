import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {after, before, test} from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const source = path.join(root, 'src/features/ai-shopping-assistant/assistant-view.ts');

let directory;
let view;

before(async () => {
    // assistant-view.ts has only type imports, so it can be transpiled and loaded on its own.
    const {outputText} = ts.transpileModule(await readFile(source, 'utf8'), {
        fileName: source,
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
    });
    directory = await mkdtemp(path.join(tmpdir(), 'assistant-view-'));
    const file = path.join(directory, 'assistant-view.mjs');
    await writeFile(file, outputText);
    view = await import(pathToFileURL(file).href);
});

after(async () => {
    await rm(directory, {recursive: true, force: true});
});

const context = {text: 'laptop with 16GB RAM', currencyCode: 'USD'};

const laptop = {
    productId: '1',
    name: 'Laptop',
    slug: 'laptop',
    description: 'Seventh-generation Intel Core processors.',
    imageUrl: 'https://cdn.test/laptop.jpg',
    productAsset: {id: 'asset-1', preview: 'https://cdn.test/laptop.jpg'},
    priceWithTax: {min: 263880, max: 275880},
    currencyCode: 'USD',
    variants: [
        {id: '3', name: 'Laptop 13 inch 16GB', sku: 'L2201316', priceWithTax: 263880, options: []},
        {id: '4', name: 'Laptop 15 inch 16GB', sku: 'L2201516', priceWithTax: 275880, options: []},
    ],
};

const trowel = {
    productId: '7',
    name: 'Hand Trowel',
    slug: 'hand-trowel',
    description: '',
    imageUrl: null,
    productAsset: null,
    priceWithTax: {min: 599, max: 599},
    currencyCode: 'USD',
    variants: [{id: '30', name: 'Hand Trowel', sku: 'HT', priceWithTax: 599, options: []}],
};

const ok = (fields = {}) => ({
    status: 'ok',
    candidates: [laptop],
    appliedAttributes: [{name: 'ram', value: '16gb'}],
    unverifiedAttributes: [],
    truncated: false,
    intent: {query: 'laptop', attributes: [{name: 'ram', value: '16gb'}]},
    notices: [],
    ...fields,
});

test('builds ProductCard data from Vendure values only', () => {
    assert.deepEqual(view.toProductCardData(laptop), {
        productId: '1',
        productName: 'Laptop',
        slug: 'laptop',
        productAsset: {id: 'asset-1', preview: 'https://cdn.test/laptop.jpg'},
        priceWithTax: {__typename: 'PriceRange', min: 263880, max: 275880},
        currencyCode: 'USD',
    });
    assert.deepEqual(view.toProductCardData(trowel).priceWithTax, {__typename: 'SinglePrice', value: 599});
    assert.equal(view.toProductCardData(trowel).productAsset, null);
});

test('maps grounded results to product cards, criteria and matching variants', () => {
    const state = view.toAssistantState(ok({
        candidates: [laptop, trowel],
        intent: {query: 'laptop', minPrice: 1000, maxPrice: 300000, collectionSlug: 'electronics', attributes: [{name: 'ram', value: '16gb'}], sort: {by: 'price', order: 'ASC'}},
        unverifiedAttributes: [{name: 'processor', value: 'i7'}],
        truncated: true,
    }), context);

    assert.equal(state.status, 'results');
    assert.equal(state.text, 'laptop with 16GB RAM');
    assert.deepEqual(state.products, [
        {card: view.toProductCardData(laptop), matchingVariants: ['Laptop 13 inch 16GB', 'Laptop 15 inch 16GB']},
        {card: view.toProductCardData(trowel), matchingVariants: []},
    ]);
    assert.deepEqual(state.criteria, [
        {type: 'query', value: 'laptop'},
        {type: 'minPrice', value: 1000, currencyCode: 'USD'},
        {type: 'maxPrice', value: 300000, currencyCode: 'USD'},
        {type: 'collection', value: 'electronics'},
        {type: 'attribute', name: 'ram', value: '16gb'},
        {type: 'sort', value: {by: 'price', order: 'ASC'}},
    ]);
    assert.deepEqual(state.unverifiedAttributes, [{name: 'processor', value: 'i7'}]);
    assert.equal(state.searchQuery, 'laptop');
    assert.equal(state.truncated, true);
    assert.equal(state.currencyNotice, null);
});

test('shows only attributes the catalog verified as criteria', () => {
    const state = view.toAssistantState(ok({
        appliedAttributes: [],
        unverifiedAttributes: [{name: 'location', value: 'indoor'}],
        intent: {query: 'plant', attributes: [{name: 'location', value: 'indoor'}]},
    }), context);

    assert.deepEqual(state.criteria, [{type: 'query', value: 'plant'}]);
});

test('returns an empty product list when Vendure found nothing', () => {
    const state = view.toAssistantState(ok({candidates: [], appliedAttributes: []}), context);

    assert.equal(state.status, 'results');
    assert.deepEqual(state.products, []);
    assert.equal(state.searchQuery, 'laptop');
});

test('omits the search link query when the intent had no keywords', () => {
    const state = view.toAssistantState(ok({intent: {maxPrice: 2000}}), context);

    assert.equal(state.searchQuery, null);
});

test('carries currency notices', () => {
    const notices = [{type: 'currency_mismatch', requested: 'EUR', active: 'USD'}];

    assert.deepEqual(view.toAssistantState(ok({notices}), context).currencyNotice, {requested: 'EUR', active: 'USD'});
    assert.deepEqual(view.toAssistantState({status: 'no_criteria', notices}, context), {
        status: 'no_criteria',
        text: context.text,
        currencyNotice: {requested: 'EUR', active: 'USD'},
    });
});

test('collapses every failure into general states without internal reason codes', () => {
    for (const reason of ['provider_error', 'timeout', 'not_configured', 'invalid_output', 'catalog_error']) {
        assert.deepEqual(view.toAssistantState({status: 'unavailable', reason}, context), {status: 'unavailable', text: context.text}, reason);
    }
    assert.deepEqual(view.toAssistantState({status: 'unavailable', reason: 'rate_limited'}, context), {status: 'rate_limited', text: context.text});
    assert.deepEqual(view.toAssistantState({status: 'invalid_request'}, context), {status: 'invalid_request', text: context.text});
});

test('never forwards fields beyond the browser contract', () => {
    const state = view.toAssistantState(ok({candidates: [{...laptop, internalNote: 'secret'}]}), context);

    assert.deepEqual(Object.keys(state).sort(), ['criteria', 'currencyNotice', 'products', 'searchQuery', 'status', 'text', 'truncated', 'unverifiedAttributes']);
    assert.doesNotMatch(JSON.stringify(state), /secret|description|sku/);
});
