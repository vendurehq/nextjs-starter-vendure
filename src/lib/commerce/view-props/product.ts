import type {ResultOf} from '@/graphql';
import {GetProductDetailQuery} from '@/lib/vendure/queries';
import {getDisplayOptionGroups} from '@/lib/vendure/product-options';
import {readStorefrontProduct} from '@/storefront/vendure/product';

type Product = NonNullable<ResultOf<typeof GetProductDetailQuery>['product']>;
type StorefrontProductFields = ReturnType<typeof readStorefrontProduct>;

export type ProductDetailViewProduct = Product & StorefrontProductFields & {
    optionGroups: ReturnType<typeof getDisplayOptionGroups>;
};

export interface ProductDetailViewProps {
    product: ProductDetailViewProduct;
    primaryCollection?: Product['collections'][number];
    searchParams: Record<string, string | string[] | undefined>;
    currencyCode: string;
    translations: {
        home: string;
    };
}

export function buildProductDetailViewProps({
    product,
    searchParams,
    currencyCode,
    translations,
}: {
    product: Product;
    searchParams: Record<string, string | string[] | undefined>;
    currencyCode: string;
    translations: ProductDetailViewProps['translations'];
}): ProductDetailViewProps {
    const primaryCollection = product.collections?.find(c => c.parent?.id) ?? product.collections?.[0];
    const storefrontProduct = readStorefrontProduct(product);

    return {
        product: {
            ...product,
            ...storefrontProduct,
            optionGroups: getDisplayOptionGroups(product),
        },
        primaryCollection,
        searchParams,
        currencyCode,
        translations,
    };
}
