import type {Metadata} from 'next';
import {Suspense} from 'react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {SearchResults} from "@/features/search/routes/search-results";
import {SearchTerm, SearchTermSkeleton} from "@/features/search/routes/search-term";
import {SearchResultsSkeleton} from "@/features/search/components/search-results-skeleton";
import {SITE_NAME, noIndexRobots} from '@/config/metadata';

export async function generateMetadata({
    searchParams,
}: PageProps<'/[locale]/search'>): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Search'});
    const searchQuery = resolvedParams.q as string | undefined;

    const title = searchQuery
        ? t('resultsTitle', {query: searchQuery})
        : t('pageTitle');

    return {
        title,
        description: searchQuery
            ? t('metaDescription', {query: searchQuery, siteName: SITE_NAME})
            : t('metaCatalogDescription', {siteName: SITE_NAME}),
        robots: noIndexRobots(),
    };
}

export default async function SearchPage({searchParams}: PageProps<'/[locale]/search'>) {
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
