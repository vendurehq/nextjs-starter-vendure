import {unstable_cache} from 'next/cache';
import {query} from '@/lib/vendure/api';
import {GetTopCollectionsQuery} from '@/lib/vendure/queries';

export const getTopCollections = unstable_cache(
    async (languageCode?: string) => {
        const result = await query(GetTopCollectionsQuery, undefined, {
            languageCode,
            skipLanguageCookie: true, // Prevent cookie access inside cached function
            skipCurrencyCookie: true, // Collections don't need currency
        });
        return result.data.collections.items;
    },
    ['top-collections'],
    {
        revalidate: 3600, // Cache for 1 hour
        tags: ['collections']
    }
);
