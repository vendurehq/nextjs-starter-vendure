import { Suspense } from 'react';
import { query } from '@/lib/vendure/api';
import { SearchProductsQuery } from '@/lib/vendure/queries';
import { ProductGrid } from '@/components/product-grid';
import { FacetFilters } from '@/components/facet-filters';
import { ProductGridSkeleton } from '@/components/product-grid-skeleton';
import { buildSearchInput, getCurrentPage } from '@/lib/search-helpers';

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const searchParamsResolved = await searchParams;
    const searchTerm = (searchParamsResolved.q as string) || '';
    const page = getCurrentPage(searchParamsResolved);

    const productDataPromise = query(SearchProductsQuery, {
        input: buildSearchInput({ searchParams: searchParamsResolved })
    });

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            {/* Search Term Display */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    {searchTerm ? `Search results for "${searchTerm}"` : 'Search'}
                </h1>
            </div>

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
