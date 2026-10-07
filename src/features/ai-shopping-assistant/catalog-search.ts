import {query} from '@/platform/vendure/api';
import {readFragment} from '@/platform/vendure/graphql';
import {ProductCardFragment} from '@/features/products/graphql';
import {SearchProductsQuery} from '@/features/search/graphql';
import {GetCandidateProductsQuery} from './graphql';
import {
    buildCatalogSearchInput,
    buildProductCandidates,
    DEFAULT_CANDIDATE_LIMIT,
    DETAIL_LIMIT,
    filterByPriceOverlap,
    type ProductCandidateSelection,
} from './catalog-filter';
import type {ShoppingIntent} from './intent';

export type {ProductCandidate, ProductCandidateVariant} from './catalog-filter';

export interface CatalogSearchOptions {
    languageCode: string;
    currencyCode: string;
    limit?: number;
}

export type CatalogSearchResult =
    | (ProductCandidateSelection & {
        status: 'ok';
        /** True when more catalog products may match than were examined or returned. */
        truncated: boolean;
    })
    | { status: 'error' };

/**
 * Find real Vendure products for a validated ShoppingIntent.
 * One bounded Vendure search finds products, one batched query loads their variants,
 * and criteria Vendure search cannot apply are checked against that returned data.
 */
export async function searchCatalog(
    intent: ShoppingIntent,
    {languageCode, currencyCode, limit = DEFAULT_CANDIDATE_LIMIT}: CatalogSearchOptions,
): Promise<CatalogSearchResult> {
    try {
        const {data: {search}} = await query(SearchProductsQuery, {
            input: buildCatalogSearchInput(intent),
        }, {languageCode, currencyCode});

        const items = search.items.map(item => readFragment(ProductCardFragment, item));
        const priced = filterByPriceOverlap(items, intent);
        const selected = priced.slice(0, DETAIL_LIMIT);

        const details = selected.length
            ? (await query(GetCandidateProductsQuery, {
                ids: selected.map(item => item.productId),
                take: selected.length,
            }, {languageCode, currencyCode})).data.products.items
            : [];

        const selection = buildProductCandidates(selected, details, intent);
        return {
            status: 'ok',
            ...selection,
            candidates: selection.candidates.slice(0, limit),
            truncated: search.totalItems > items.length
                || priced.length > selected.length
                || selection.candidates.length > limit,
        };
    } catch (error) {
        console.error('AI shopping assistant catalog search failed:', error);
        return {status: 'error'};
    }
}
