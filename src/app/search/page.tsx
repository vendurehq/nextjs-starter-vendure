import {Suspense} from 'react';
import {SearchResults} from "@/app/search/search-results";
import {SearchTerm, SearchTermSkeleton} from "@/app/search/search-term";
import {SearchResultsSkeleton} from "@/components/skeletons/search-results-skeleton";

interface SearchPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({params, searchParams}: SearchPageProps) {
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
