import {ProductCarousel} from "@core/components/commerce/product-carousel";
import {cacheLife} from "next/cache";
import {query} from "@core/lib/vendure/api";
import {GetCollectionProductsQuery} from "@core/lib/vendure/queries";

export interface FeaturedProductsProps {}

async function getFeaturedCollectionProducts() {
    'use cache'
    cacheLife('days')

    const result = await query(GetCollectionProductsQuery, {
        slug: "electronics",
        input: {
            collectionSlug: "electronics",
            take: 12,
            skip: 0,
            groupByProduct: true
        }
    });

    return result.data.search.items;
}

export async function FeaturedProducts(_props: FeaturedProductsProps) {
    const products = await getFeaturedCollectionProducts();

    return (
        <ProductCarousel
            title="Featured Products"
            products={products}
        />
    )
}
