import {cacheLife} from 'next/cache';
import {query} from './api';
import {GetActiveChannelQuery} from './channel-graphql';

/**
 * Get the active channel with caching enabled.
 * Channel configuration rarely changes, so it is cached for one hour.
 * Channel configuration is language-independent, so no locale is required.
 */
export async function getActiveChannel() {
    'use cache';
    cacheLife('hours');

    const result = await query(GetActiveChannelQuery);
    return result.data.activeChannel;
}
