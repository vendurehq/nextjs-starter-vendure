import { SearchTermSkeleton } from '@/features/search/routes/search-term';
import { SearchResultsSkeleton } from '@/features/search/components/search-results-skeleton';

export default function SearchLoading() {
    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <SearchTermSkeleton />
            <SearchResultsSkeleton />
        </div>
    );
}
