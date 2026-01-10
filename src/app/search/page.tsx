import type {Metadata} from 'next';
import {Suspense} from 'react';
import {SearchResults} from "@/app/search/search-results";
import {SearchTerm, SearchTermSkeleton} from "@/app/search/search-term";
import {SearchResultsSkeleton} from "@core/components/shared/skeletons/search-results-skeleton";
import {SITE_NAME, noIndexRobots} from '@/lib/metadata';

export async function generateMetadata({
    searchParams,
}: PageProps<'/search'>): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const searchQuery = resolvedParams.q as string | undefined;

    const title = searchQuery
        ? `Search results for "${searchQuery}"`
        : 'Search Products';

    return {
        title,
        description: searchQuery
            ? `Find products matching "${searchQuery}" at ${SITE_NAME}`
            : `Search our product catalog at ${SITE_NAME}`,
        robots: noIndexRobots(),
    };
}

export default async function SearchPage({searchParams}: PageProps<'/search'>) {
    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <Suspense fallback={<SearchTermSkeleton/>}>
                <SearchTerm searchParams={searchParams}/>
            </Suspense>
            <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults searchParams={searchParams}/>
            </Suspense>
        </div>
    );
}
