import { Suspense } from 'react';
import { query } from '@/lib/vendure/api';
import { SearchProductsQuery } from '@/lib/vendure/queries';
import { ProductGrid } from '@/components/product-grid';
import { FacetFilters } from '@/components/facet-filters';
import { ProductGridSkeleton } from '@/components/product-grid-skeleton';
import { buildSearchInput, getCurrentPage } from '@/lib/search-helpers';
import { cacheLife, cacheTag } from 'next/cache';

interface CollectionPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getCollectionProducts(slug: string, searchParams: { [key: string]: string | string[] | undefined }) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-${slug}`);

    return query(SearchProductsQuery, {
        input: buildSearchInput({
            searchParams,
            collectionSlug: slug
        })
    });
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const productDataPromise = getCollectionProducts(slug, searchParamsResolved);

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <aside className="lg:col-span-1">
                    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                        <FacetFilters productDataPromise={productDataPromise} />
                    </Suspense>
                </aside>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}