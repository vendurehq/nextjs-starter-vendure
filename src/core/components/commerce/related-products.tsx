import { ProductCarousel } from "@core/components/commerce/product-carousel";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@core/lib/vendure/api";
import { GetCollectionProductsQuery } from "@core/lib/vendure/queries";
import { readFragment } from "@/graphql";
import { ProductCardFragment } from "@core/lib/vendure/fragments";

export interface RelatedProductsProps {
    collectionSlug: string;
    currentProductId: string;
}

async function getRelatedProducts(collectionSlug: string, currentProductId: string) {
    'use cache'
    cacheLife('hours')
    cacheTag(`related-products-${collectionSlug}`)

    const result = await query(GetCollectionProductsQuery, {
        slug: collectionSlug,
        input: {
            collectionSlug: collectionSlug,
            take: 13, // Fetch extra to account for filtering out current product
            skip: 0,
            groupByProduct: true
        }
    });

    // Filter out the current product and limit to 12
    return result.data.search.items
        .filter(item => {
            const product = readFragment(ProductCardFragment, item);
            return product.productId !== currentProductId;
        })
        .slice(0, 12);
}

export async function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
    const products = await getRelatedProducts(collectionSlug, currentProductId);

    if (products.length === 0) {
        return null;
    }

    return (
        <ProductCarousel
            title="Related Products"
            products={products}
        />
    );
}
