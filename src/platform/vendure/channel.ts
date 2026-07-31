import {cacheLife} from 'next/cache';
import {query} from './api';
import {GetActiveChannelQuery} from './channel-graphql';

export async function getActiveChannel() {
    'use cache';
    cacheLife('hours');

    const result = await query(GetActiveChannelQuery);
    return result.data.activeChannel;
}

export const getActiveChannelCached = getActiveChannel;
