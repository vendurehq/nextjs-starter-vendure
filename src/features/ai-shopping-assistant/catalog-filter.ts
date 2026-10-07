import type {ResultOf, VariablesOf} from '@/platform/vendure/graphql';
import type {ProductCardFragment} from '@/features/products/graphql';
import type {SearchProductsQuery} from '@/features/search/graphql';
import type {GetCandidateProductsQuery} from './graphql';
import type {ShoppingIntent, ShoppingIntentAttribute, ShoppingIntentSort} from './intent';

// Deterministic mapping from a ShoppingIntent to Vendure search, and filtering of what Vendure returned.
// This module must stay free of runtime imports so tests can transpile it in isolation.

/** How many grouped products one Vendure search may return. */
export const SEARCH_WINDOW = 50;
/** How many search results may be expanded with variant details. */
export const DETAIL_LIMIT = 20;
export const DEFAULT_CANDIDATE_LIMIT = 8;
export const MAX_VARIANTS_PER_CANDIDATE = 5;
export const MAX_DESCRIPTION_LENGTH = 300;

export type CatalogSearchInput = VariablesOf<typeof SearchProductsQuery>['input'];
export type SearchCandidate = ResultOf<typeof ProductCardFragment>;
export type CandidateProductDetail = ResultOf<typeof GetCandidateProductsQuery>['products']['items'][number];

export interface ProductCandidateVariant {
    id: string;
    name: string;
    sku: string;
    /** Minor units of the active currency, including tax. */
    priceWithTax: number;
    /** Vendure option group and option names, such as `{group: 'RAM', value: '16GB'}`. */
    options: Array<{ group: string; value: string }>;
}

/** A real Vendure product, reduced to what the assistant needs. */
export interface ProductCandidate {
    productId: string;
    name: string;
    slug: string;
    /** Plain-text excerpt of the Vendure description; empty when the product has none. */
    description: string;
    imageUrl: string | null;
    /** The product asset exactly as Vendure search returned it, in the shape ProductCard expects. */
    productAsset: SearchCandidate['productAsset'];
    /** Price range of the variants that satisfy the intent, in minor units including tax. */
    priceWithTax: { min: number; max: number };
    currencyCode: SearchCandidate['currencyCode'];
    /** Cheapest variants that satisfy the intent. */
    variants: ProductCandidateVariant[];
}

export interface ProductCandidateSelection {
    candidates: ProductCandidate[];
    /** Attributes found in the candidates' facets or options and enforced on every candidate. */
    appliedAttributes: ShoppingIntentAttribute[];
    /** Attributes that no examined product's catalog data describes, so they could not be enforced. */
    unverifiedAttributes: ShoppingIntentAttribute[];
}

/**
 * The sort Vendure should apply. Without an explicit preference, price bounds sort by price
 * so that the bounded search window starts with the products most likely to fit the budget.
 */
export function effectiveSort(intent: ShoppingIntent): ShoppingIntentSort | undefined {
    if (intent.sort) return intent.sort;
    if (intent.maxPrice !== undefined) return {by: 'price', order: 'ASC'};
    if (intent.minPrice !== undefined) return {by: 'price', order: 'DESC'};
    return undefined;
}

export function buildCatalogSearchInput(intent: ShoppingIntent): CatalogSearchInput {
    const sort = effectiveSort(intent);
    return {
        ...(intent.query && {term: intent.query}),
        ...(intent.collectionSlug && {collectionSlug: intent.collectionSlug}),
        groupByProduct: true,
        take: SEARCH_WINDOW,
        skip: 0,
        ...(sort && {sort: sort.by === 'price' ? {price: sort.order} : {name: sort.order}}),
    };
}

/** Keep search results whose price range overlaps the intent's price bounds. */
export function filterByPriceOverlap(items: SearchCandidate[], intent: ShoppingIntent): SearchCandidate[] {
    return items.filter(item => {
        const [min, max] = item.priceWithTax.__typename === 'PriceRange'
            ? [item.priceWithTax.min, item.priceWithTax.max]
            : [item.priceWithTax.value, item.priceWithTax.value];
        return (intent.maxPrice === undefined || min <= intent.maxPrice)
            && (intent.minPrice === undefined || max >= intent.minPrice);
    });
}

/**
 * Turn Vendure search results and their variant details into candidates.
 * A candidate keeps only variants whose real price and attributes satisfy the intent;
 * products Vendure did not return details for are dropped, never guessed.
 */
export function buildProductCandidates(
    searchItems: SearchCandidate[],
    details: CandidateProductDetail[],
    intent: ShoppingIntent,
): ProductCandidateSelection {
    const attributes = intent.attributes ?? [];
    const appliedAttributes = attributes.filter(attribute => isDescribedByCatalog(attribute, details));
    // Without examined products there is no catalog data to judge an attribute against.
    const unverifiedAttributes = details.length
        ? attributes.filter(attribute => !appliedAttributes.includes(attribute))
        : [];
    const detailsById = new Map(details.map(product => [product.id, product]));

    const candidates: ProductCandidate[] = [];
    for (const item of searchItems) {
        const product = detailsById.get(item.productId);
        if (!product) continue;

        const variants = product.variants
            .filter(variant => isWithinPrice(variant.priceWithTax, intent) && appliedAttributes.every(attribute =>
                facetSatisfies(product, attribute) || optionSatisfies(variant, attribute)))
            .sort((a, b) => a.priceWithTax - b.priceWithTax);
        if (!variants.length) continue;

        candidates.push({
            productId: item.productId,
            name: item.productName,
            slug: item.slug,
            description: toPlainText(product.description, MAX_DESCRIPTION_LENGTH),
            imageUrl: item.productAsset?.preview ?? null,
            productAsset: item.productAsset ?? null,
            priceWithTax: {min: variants[0].priceWithTax, max: variants[variants.length - 1].priceWithTax},
            currencyCode: item.currencyCode,
            variants: variants.slice(0, MAX_VARIANTS_PER_CANDIDATE).map(variant => ({
                id: variant.id,
                name: variant.name,
                sku: variant.sku,
                priceWithTax: variant.priceWithTax,
                options: variant.options.map(option => ({group: option.group.name, value: option.name})),
            })),
        });
    }

    // Vendure sorted on all variants; re-sort on the variants that actually matched.
    const sort = effectiveSort(intent);
    if (sort?.by === 'price') {
        candidates.sort((a, b) => sort.order === 'ASC'
            ? a.priceWithTax.min - b.priceWithTax.min
            : b.priceWithTax.max - a.priceWithTax.max);
    }

    return {candidates, appliedAttributes, unverifiedAttributes};
}

function isWithinPrice(price: number, intent: ShoppingIntent): boolean {
    return (intent.minPrice === undefined || price >= intent.minPrice)
        && (intent.maxPrice === undefined || price <= intent.maxPrice);
}

function isDescribedByCatalog(attribute: ShoppingIntentAttribute, details: CandidateProductDetail[]): boolean {
    return details.some(product =>
        product.facetValues.some(value => namesMatch(attribute.name, value.facet.code, value.facet.name)) ||
        product.variants.some(variant =>
            variant.options.some(option => namesMatch(attribute.name, option.group.code, option.group.name))));
}

function facetSatisfies(product: CandidateProductDetail, attribute: ShoppingIntentAttribute): boolean {
    return product.facetValues.some(value =>
        namesMatch(attribute.name, value.facet.code, value.facet.name) &&
        valuesMatch(attribute.value, value.code, value.name));
}

function optionSatisfies(variant: CandidateProductDetail['variants'][number], attribute: ShoppingIntentAttribute): boolean {
    return variant.options.some(option =>
        namesMatch(attribute.name, option.group.code, option.group.name) &&
        valuesMatch(attribute.value, option.code, option.name));
}

function words(text: string): string[] {
    return text.toLowerCase().split(/[\s\-_/.,:;()]+/).filter(Boolean);
}

/** An attribute name matches a label containing all of its words, so `ram` matches `laptop-ram`. */
function namesMatch(name: string, ...labels: string[]): boolean {
    const wanted = words(name);
    return wanted.length > 0 && labels.some(label => {
        const available = words(label);
        return wanted.every(word => available.includes(word));
    });
}

/** An attribute value must equal a label exactly, ignoring case and separators, so `16 gb` matches `16GB`. */
function valuesMatch(value: string, ...labels: string[]): boolean {
    const wanted = words(value).join('');
    return wanted.length > 0 && labels.some(label => words(label).join('') === wanted);
}

function toPlainText(html: string, maxLength: number): string {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}
