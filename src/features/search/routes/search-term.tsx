import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';

interface SearchTermProps {
    searchParams: Promise<{
        q?: string
    }>;
}

export async function SearchTerm({searchParams}: SearchTermProps) {
    const searchParamsResolved = await searchParams;
    const searchTerm = (searchParamsResolved.q as string) || '';
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Search'});

    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold">
                {searchTerm ? t('resultsFor', {query: searchTerm}) : t('title')}
            </h1>
        </div>
    )
}

export function SearchTermSkeleton() {
    return (
        <div className="mb-6">
            <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
    )
}
