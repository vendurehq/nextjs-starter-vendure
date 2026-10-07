import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {after, before, test} from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');
const source = path.join(root, 'src/features/ai-shopping-assistant/catalog-filter.ts');

let directory;
let filter;

before(async () => {
    // catalog-filter.ts has only type imports, so it can be transpiled and loaded on its own.
    const {outputText} = ts.transpileModule(await readFile(source, 'utf8'), {
        fileName: source,
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
    });
    directory = await mkdtemp(path.join(tmpdir(), 'catalog-filter-'));
    const file = path.join(directory, 'catalog-filter.mjs');
    await writeFile(file, outputText);
    filter = await import(pathToFileURL(file).href);
});

after(async () => {
    await rm(directory, {recursive: true, force: true});
});

const facet = (facetCode, code, name) => ({code, name, facet: {code: facetCode, name: facetCode}});
const option = (groupCode, groupName, code, name) => ({code, name, group: {code: groupCode, name: groupName}});
const variant = (id, name, priceWithTax, options) => ({id, name, sku: `SKU-${id}`, priceWithTax, currencyCode: 'USD', options});

const laptop = {
    id: '1',
    description: '<p>Seventh-generation   <b>Intel Core</b> processors.</p>',
    facetValues: [facet('category', 'computers', 'Computers'), facet('brand', 'apple', 'Apple')],
    variants: [
        variant('1', 'Laptop 13 inch 8GB', 155880, [option('laptop-screen-size', 'screen size', '13-inch', '13 inch'), option('laptop-ram', 'RAM', '8gb', '8GB')]),
        variant('2', 'Laptop 15 inch 8GB', 167880, [option('laptop-screen-size', 'screen size', '15-inch', '15 inch'), option('laptop-ram', 'RAM', '8gb', '8GB')]),
        variant('3', 'Laptop 13 inch 16GB', 263880, [option('laptop-screen-size', 'screen size', '13-inch', '13 inch'), option('laptop-ram', 'RAM', '16gb', '16GB')]),
        variant('4', 'Laptop 15 inch 16GB', 275880, [option('laptop-screen-size', 'screen size', '15-inch', '15 inch'), option('laptop-ram', 'RAM', '16gb', '16GB')]),
    ],
};

const tablet = {
    id: '2',
    description: '',
    facetValues: [facet('category', 'computers', 'Computers'), facet('brand', 'apple', 'Apple')],
    variants: [
        variant('5', 'Tablet 32GB', 39480, [option('tablet-storage', 'storage', '32gb', '32GB')]),
        variant('6', 'Tablet 128GB', 53880, [option('tablet-storage', 'storage', '128gb', '128GB')]),
    ],
};

const searchItem = (product, name, slug) => {
    const prices = product.variants.map(v => v.priceWithTax);
    return {
        productId: product.id,
        productName: name,
        slug,
        productAsset: {id: `asset-${product.id}`, preview: `https://cdn.test/${slug}.jpg`},
        priceWithTax: {__typename: 'PriceRange', min: Math.min(...prices), max: Math.max(...prices)},
        currencyCode: 'USD',
    };
};

const laptopItem = searchItem(laptop, 'Laptop', 'laptop');
const tabletItem = searchItem(tablet, 'Tablet', 'tablet');

test('maps an intent to a bounded, grouped Vendure search input', () => {
    assert.deepEqual(filter.buildCatalogSearchInput({
        query: 'laptop',
        collectionSlug: 'computers',
        sort: {by: 'name', order: 'DESC'},
    }), {
        term: 'laptop',
        collectionSlug: 'computers',
        groupByProduct: true,
        take: filter.SEARCH_WINDOW,
        skip: 0,
        sort: {name: 'DESC'},
    });

    assert.deepEqual(filter.buildCatalogSearchInput({}), {
        groupByProduct: true,
        take: filter.SEARCH_WINDOW,
        skip: 0,
    });
});

test('sorts by price when only price bounds express a preference', () => {
    assert.deepEqual(filter.buildCatalogSearchInput({maxPrice: 150000}).sort, {price: 'ASC'});
    assert.deepEqual(filter.buildCatalogSearchInput({minPrice: 150000}).sort, {price: 'DESC'});
    assert.deepEqual(filter.buildCatalogSearchInput({maxPrice: 150000, sort: {by: 'name', order: 'ASC'}}).sort, {name: 'ASC'});
});

test('keeps search results whose price range overlaps the bounds', () => {
    const single = {...tabletItem, productId: '9', priceWithTax: {__typename: 'SinglePrice', value: 100000}};
    const items = [laptopItem, tabletItem, single];

    assert.deepEqual(filter.filterByPriceOverlap(items, {maxPrice: 150000}).map(i => i.productId), ['2', '9']);
    assert.deepEqual(filter.filterByPriceOverlap(items, {minPrice: 200000}).map(i => i.productId), ['1']);
    assert.deepEqual(filter.filterByPriceOverlap(items, {minPrice: 160000, maxPrice: 170000}).map(i => i.productId), ['1']);
    assert.equal(filter.filterByPriceOverlap(items, {}).length, 3);
});

test('builds candidates only from real Vendure data', () => {
    const {candidates, appliedAttributes, unverifiedAttributes} =
        filter.buildProductCandidates([laptopItem], [laptop], {query: 'laptop'});

    assert.deepEqual(appliedAttributes, []);
    assert.deepEqual(unverifiedAttributes, []);
    assert.deepEqual(candidates, [{
        productId: '1',
        name: 'Laptop',
        slug: 'laptop',
        description: 'Seventh-generation Intel Core processors.',
        imageUrl: 'https://cdn.test/laptop.jpg',
        productAsset: {id: 'asset-1', preview: 'https://cdn.test/laptop.jpg'},
        priceWithTax: {min: 155880, max: 275880},
        currencyCode: 'USD',
        variants: laptop.variants.map(v => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            priceWithTax: v.priceWithTax,
            options: v.options.map(o => ({group: o.group.name, value: o.name})),
        })),
    }]);
});

test('enforces option attributes per variant', () => {
    const {candidates, appliedAttributes} = filter.buildProductCandidates(
        [laptopItem, tabletItem],
        [laptop, tablet],
        {attributes: [{name: 'ram', value: '16 gb'}]},
    );

    assert.deepEqual(appliedAttributes, [{name: 'ram', value: '16 gb'}]);
    assert.deepEqual(candidates.map(c => c.productId), ['1']);
    assert.deepEqual(candidates[0].variants.map(v => v.id), ['3', '4']);
    assert.deepEqual(candidates[0].priceWithTax, {min: 263880, max: 275880});
});

test('combines price and attributes without inventing a match', () => {
    const {candidates, appliedAttributes} = filter.buildProductCandidates(
        [laptopItem],
        [laptop],
        {query: 'laptop', maxPrice: 150000, attributes: [{name: 'ram', value: '16gb'}]},
    );

    assert.deepEqual(appliedAttributes, [{name: 'ram', value: '16gb'}]);
    assert.deepEqual(candidates, []);
});

test('enforces facet attributes at product level', () => {
    const shoe = {
        id: '3',
        description: '',
        facetValues: [facet('category', 'footwear', 'Footwear'), facet('brand', 'nike', 'Nike')],
        variants: [variant('7', 'Running Shoe 40', 9999, [])],
    };
    const {candidates} = filter.buildProductCandidates(
        [laptopItem, searchItem(shoe, 'Running Shoe', 'running-shoe')],
        [laptop, shoe],
        {attributes: [{name: 'brand', value: 'nike'}]},
    );

    assert.deepEqual(candidates.map(c => c.productId), ['3']);
});

test('reports attributes the catalog cannot verify instead of enforcing them', () => {
    const {candidates, appliedAttributes, unverifiedAttributes} = filter.buildProductCandidates(
        [laptopItem],
        [laptop],
        {attributes: [{name: 'processor', value: 'i7'}, {name: 'ram', value: '8gb'}]},
    );

    assert.deepEqual(appliedAttributes, [{name: 'ram', value: '8gb'}]);
    assert.deepEqual(unverifiedAttributes, [{name: 'processor', value: 'i7'}]);
    assert.deepEqual(candidates[0].variants.map(v => v.id), ['1', '2']);
});

test('does not judge attributes when no products were examined', () => {
    assert.deepEqual(filter.buildProductCandidates([], [], {attributes: [{name: 'ram', value: '16gb'}]}), {
        candidates: [],
        appliedAttributes: [],
        unverifiedAttributes: [],
    });
});

test('does not treat a partial value as a match', () => {
    const {candidates} = filter.buildProductCandidates(
        [laptopItem],
        [laptop],
        {attributes: [{name: 'ram', value: '6gb'}]},
    );

    assert.deepEqual(candidates, []);
});

test('keeps a missing Vendure asset as null', () => {
    const {candidates} = filter.buildProductCandidates([{...tabletItem, productAsset: null}], [tablet], {});

    assert.equal(candidates[0].productAsset, null);
    assert.equal(candidates[0].imageUrl, null);
});

test('drops search results without Vendure details', () => {
    const {candidates} = filter.buildProductCandidates([laptopItem, tabletItem], [tablet], {});

    assert.deepEqual(candidates.map(c => c.productId), ['2']);
});

test('re-sorts by the price of matching variants', () => {
    const ascending = filter.buildProductCandidates([laptopItem, tabletItem], [laptop, tablet], {maxPrice: 200000});
    assert.deepEqual(ascending.candidates.map(c => [c.productId, c.priceWithTax]), [
        ['2', {min: 39480, max: 53880}],
        ['1', {min: 155880, max: 167880}],
    ]);

    const descending = filter.buildProductCandidates([tabletItem, laptopItem], [laptop, tablet], {sort: {by: 'price', order: 'DESC'}});
    assert.deepEqual(descending.candidates.map(c => c.productId), ['1', '2']);
});

test('limits variants per candidate to the cheapest matches', () => {
    const many = {
        id: '4',
        description: '',
        facetValues: [],
        variants: Array.from({length: 8}, (_, i) => variant(`v${i}`, `Size ${i}`, 1000 * (8 - i), [])),
    };
    const {candidates} = filter.buildProductCandidates([searchItem(many, 'Many', 'many')], [many], {});

    assert.equal(candidates[0].variants.length, filter.MAX_VARIANTS_PER_CANDIDATE);
    assert.deepEqual(candidates[0].variants.map(v => v.priceWithTax), [1000, 2000, 3000, 4000, 5000]);
    assert.deepEqual(candidates[0].priceWithTax, {min: 1000, max: 8000});
});
