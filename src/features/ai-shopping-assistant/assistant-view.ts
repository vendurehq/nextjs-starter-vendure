import type {ResultOf} from '@/platform/vendure/graphql';
import type {ProductCardFragment} from '@/features/products/graphql';
import type {ShoppingAssistantResult} from './assistant-flow';
import type {ProductCandidate} from './catalog-filter';
import type {ShoppingIntentAttribute, ShoppingIntentSort} from './intent';

// The state the assistant UI receives from the server action. It carries only Vendure product data,
// the validated search criteria, and general status categories: never provider details or reason codes.
// This module must stay free of runtime imports so tests can transpile it in isolation.

export type AssistantProductCard = ResultOf<typeof ProductCardFragment>;

export interface AssistantProduct {
    card: AssistantProductCard;
    /** Vendure names of the variants that satisfied the request, when they add information. */
    matchingVariants: string[];
}

export type AssistantCriterion =
    | { type: 'query'; value: string }
    | { type: 'minPrice' | 'maxPrice'; value: number; currencyCode: string }
    | { type: 'collection'; value: string }
    | { type: 'attribute'; name: string; value: string }
    | { type: 'sort'; value: ShoppingIntentSort };

export interface CurrencyNotice {
    requested: string;
    active: string;
}

export type AssistantState =
    | { status: 'idle'; text: string }
    | {
        status: 'results';
        text: string;
        products: AssistantProduct[];
        criteria: AssistantCriterion[];
        unverifiedAttributes: ShoppingIntentAttribute[];
        currencyNotice: CurrencyNotice | null;
        /** Keyword query for the regular storefront search, when the request had one. */
        searchQuery: string | null;
        truncated: boolean;
    }
    | { status: 'no_criteria'; text: string; currencyNotice: CurrencyNotice | null }
    | { status: 'invalid_request'; text: string }
    | { status: 'rate_limited'; text: string }
    | { status: 'unavailable'; text: string };

export function toAssistantState(
    result: ShoppingAssistantResult,
    {text, currencyCode}: { text: string; currencyCode: string },
): AssistantState {
    switch (result.status) {
        case 'ok': {
            const {intent} = result;
            const criteria: AssistantCriterion[] = [];
            if (intent.query) criteria.push({type: 'query', value: intent.query});
            if (intent.minPrice !== undefined) criteria.push({type: 'minPrice', value: intent.minPrice, currencyCode});
            if (intent.maxPrice !== undefined) criteria.push({type: 'maxPrice', value: intent.maxPrice, currencyCode});
            if (intent.collectionSlug) criteria.push({type: 'collection', value: intent.collectionSlug});
            for (const attribute of result.appliedAttributes) {
                criteria.push({type: 'attribute', name: attribute.name, value: attribute.value});
            }
            if (intent.sort) criteria.push({type: 'sort', value: intent.sort});

            return {
                status: 'results',
                text,
                products: result.candidates.map(candidate => ({
                    card: toProductCardData(candidate),
                    matchingVariants: candidate.variants
                        .map(variant => variant.name)
                        .filter(name => name !== candidate.name),
                })),
                criteria,
                unverifiedAttributes: result.unverifiedAttributes,
                currencyNotice: toCurrencyNotice(result.notices),
                searchQuery: intent.query ?? null,
                truncated: result.truncated,
            };
        }
        case 'no_criteria':
            return {status: 'no_criteria', text, currencyNotice: toCurrencyNotice(result.notices)};
        case 'invalid_request':
            return {status: 'invalid_request', text};
        case 'unavailable':
            // A busy provider is the only failure worth distinguishing for shoppers.
            return result.reason === 'rate_limited' ? {status: 'rate_limited', text} : {status: 'unavailable', text};
    }
}

/** ProductCard data built only from Vendure values carried by the candidate. */
export function toProductCardData(candidate: ProductCandidate): AssistantProductCard {
    const {min, max} = candidate.priceWithTax;
    return {
        productId: candidate.productId,
        productName: candidate.name,
        slug: candidate.slug,
        productAsset: candidate.productAsset,
        priceWithTax: min === max
            ? {__typename: 'SinglePrice', value: min}
            : {__typename: 'PriceRange', min, max},
        currencyCode: candidate.currencyCode,
    };
}

function toCurrencyNotice(notices: Array<{ requested: string; active: string }>): CurrencyNotice | null {
    const [notice] = notices;
    return notice ? {requested: notice.requested, active: notice.active} : null;
}
