import {ProductCarousel} from "@core/components/commerce/product-carousel";
import {cacheLife} from "next/cache";
import {query} from "@/lib/vendure/api";
import {GetCollectionProductsQuery} from "@/lib/vendure/queries";

async function getFeaturedCollectionProducts() {
    'use cache'
    cacheLife('days')

    // Fetch featured products from a specific collection
    // Replace 'featured' with your actual collection slug
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


export async function FeaturedProducts() {
    const products = await getFeaturedCollectionProducts();

    return (
        <ProductCarousel
            title="Featured Products"
            products={products}
        />
    )
}