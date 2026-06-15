import type { ResultOf } from 'gql.tada';
import type { GetProductDetailQuery } from './queries';

type ProductDetail = NonNullable<ResultOf<typeof GetProductDetailQuery>['product']>;

/**
 * Vendure 3.6 made ProductOptionGroup/ProductOption shared and channel-aware
 * (vendure#4469): a product's `optionGroups` now returns every option in the
 * (possibly shared) group, including options for which this product has no
 * variant. Rendering those directly produces "phantom" option buttons with no
 * price, no stock status, and a permanently disabled add-to-cart.
 *
 * This returns the option groups reduced to the options actually used by one of
 * the product's variants, dropping any group left with no options.
 */
export function getDisplayOptionGroups(product: ProductDetail): ProductDetail['optionGroups'] {
    const usedOptionIds = new Set(
        product.variants.flatMap((variant) => variant.options.map((option) => option.id)),
    );

    return product.optionGroups
        .map((group) => ({
            ...group,
            options: group.options.filter((option) => usedOptionIds.has(option.id)),
        }))
        .filter((group) => group.options.length > 0);
}
