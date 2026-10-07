import type {VariablesOf} from '@/platform/vendure/graphql';
import type {SearchProductsQuery} from '@/features/search/graphql';

// This module must stay free of runtime imports: it is the pure contract between
// untrusted model output and Vendure search, and tests transpile it in isolation.

type SearchSort = NonNullable<VariablesOf<typeof SearchProductsQuery>['input']['sort']>;

export const SHOPPING_INTENT_SORT_FIELDS = ['name', 'price'] as const satisfies readonly (keyof SearchSort)[];
export const SHOPPING_INTENT_SORT_ORDERS = ['ASC', 'DESC'] as const satisfies readonly NonNullable<SearchSort[keyof SearchSort]>[];

export const MAX_QUERY_LENGTH = 200;
export const MAX_TEXT_LENGTH = 100;
export const MAX_ATTRIBUTES = 10;

export interface ShoppingIntentAttribute {
    /** Attribute name, matched later against Vendure facet or option group codes and names. */
    name: string;
    /** Attribute value, matched later against Vendure facet value or option codes and names. */
    value: string;
}

export interface ShoppingIntentSort {
    by: (typeof SHOPPING_INTENT_SORT_FIELDS)[number];
    order: (typeof SHOPPING_INTENT_SORT_ORDERS)[number];
}

/**
 * What a customer is looking for, expressed as search criteria.
 * It never names concrete products: Vendure remains the source of truth for what exists.
 */
export interface ShoppingIntent {
    /** Free-text search term. */
    query?: string;
    /** Inclusive lower price bound, in minor units of the active currency, including tax. */
    minPrice?: number;
    /** Inclusive upper price bound, in minor units of the active currency, including tax. */
    maxPrice?: number;
    /** Vendure collection slug. */
    collectionSlug?: string;
    /** Required product attributes, such as `{name: 'ram', value: '16gb'}`. */
    attributes?: ShoppingIntentAttribute[];
    sort?: ShoppingIntentSort;
}

export interface ShoppingIntentIssue {
    path: string;
    message: string;
}

export type ShoppingIntentResult =
    | { success: true; intent: ShoppingIntent }
    | { success: false; issues: ShoppingIntentIssue[] };

/**
 * Validate and normalize untrusted input into a ShoppingIntent.
 * Whitespace is collapsed, slugs and attributes are lowercased, duplicate attributes are removed,
 * `null` and blank values are treated as absent, and unknown keys are dropped.
 */
export function parseShoppingIntent(input: unknown): ShoppingIntentResult {
    if (!isRecord(input)) {
        return {success: false, issues: [{path: '', message: 'Expected an object.'}]};
    }

    const issues: ShoppingIntentIssue[] = [];
    const intent: ShoppingIntent = {};

    const query = readText(input.query, 'query', MAX_QUERY_LENGTH, issues);
    if (query) intent.query = query;

    const minPrice = readPrice(input.minPrice, 'minPrice', issues);
    if (minPrice !== undefined) intent.minPrice = minPrice;

    const maxPrice = readPrice(input.maxPrice, 'maxPrice', issues);
    if (maxPrice !== undefined) intent.maxPrice = maxPrice;

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        issues.push({path: 'maxPrice', message: 'Must be greater than or equal to minPrice.'});
    }

    const collectionSlug = readText(input.collectionSlug, 'collectionSlug', MAX_TEXT_LENGTH, issues)?.toLowerCase();
    if (collectionSlug?.includes(' ')) {
        issues.push({path: 'collectionSlug', message: 'Expected a collection slug.'});
    } else if (collectionSlug) {
        intent.collectionSlug = collectionSlug;
    }

    const attributes = readAttributes(input.attributes, issues);
    if (attributes?.length) intent.attributes = attributes;

    const sort = readSort(input.sort, issues);
    if (sort) intent.sort = sort;

    return issues.length ? {success: false, issues} : {success: true, intent};
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown, path: string, maxLength: number, issues: ShoppingIntentIssue[]): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') {
        issues.push({path, message: 'Expected a string.'});
        return undefined;
    }
    const text = value.replace(/\s+/g, ' ').trim();
    if (text.length > maxLength) {
        issues.push({path, message: `Must be at most ${maxLength} characters.`});
        return undefined;
    }
    return text || undefined;
}

function readPrice(value: unknown, path: string, issues: ShoppingIntentIssue[]): number | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
        issues.push({path, message: 'Expected a non-negative integer amount in minor currency units.'});
        return undefined;
    }
    return value;
}

function readAttributes(value: unknown, issues: ShoppingIntentIssue[]): ShoppingIntentAttribute[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (!Array.isArray(value)) {
        issues.push({path: 'attributes', message: 'Expected an array.'});
        return undefined;
    }
    if (value.length > MAX_ATTRIBUTES) {
        issues.push({path: 'attributes', message: `Must contain at most ${MAX_ATTRIBUTES} items.`});
        return undefined;
    }

    const attributes = new Map<string, ShoppingIntentAttribute>();
    value.forEach((item, index) => {
        const path = `attributes.${index}`;
        if (!isRecord(item)) {
            issues.push({path, message: 'Expected an object.'});
            return;
        }
        const name = readText(item.name, `${path}.name`, MAX_TEXT_LENGTH, issues)?.toLowerCase();
        const attributeValue = readText(item.value, `${path}.value`, MAX_TEXT_LENGTH, issues)?.toLowerCase();
        if (!name) issues.push({path: `${path}.name`, message: 'Required.'});
        if (!attributeValue) issues.push({path: `${path}.value`, message: 'Required.'});
        if (name && attributeValue) {
            attributes.set(`${name}\u0000${attributeValue}`, {name, value: attributeValue});
        }
    });
    return [...attributes.values()];
}

function readSort(value: unknown, issues: ShoppingIntentIssue[]): ShoppingIntentSort | undefined {
    if (value === undefined || value === null) return undefined;
    if (!isRecord(value)) {
        issues.push({path: 'sort', message: 'Expected an object.'});
        return undefined;
    }

    const by = typeof value.by === 'string' ? value.by.trim().toLowerCase() : value.by;
    const order = typeof value.order === 'string' ? value.order.trim().toUpperCase() : value.order;
    const validBy = SHOPPING_INTENT_SORT_FIELDS.find(field => field === by);
    const validOrder = SHOPPING_INTENT_SORT_ORDERS.find(sortOrder => sortOrder === order);

    if (!validBy) issues.push({path: 'sort.by', message: `Expected one of ${SHOPPING_INTENT_SORT_FIELDS.join(', ')}.`});
    if (!validOrder) issues.push({path: 'sort.order', message: `Expected one of ${SHOPPING_INTENT_SORT_ORDERS.join(', ')}.`});
    return validBy && validOrder ? {by: validBy, order: validOrder} : undefined;
}
