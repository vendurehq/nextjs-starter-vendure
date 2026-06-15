import type {ResultOf} from '@/graphql';
import {SearchProductsQuery} from '@/lib/vendure/queries';

export interface CollectionViewProps {
    collectionName: string;
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
    currentPage: number;
    take: number;
    translations: {
        home: string;
    };
}
