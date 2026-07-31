'use server';

import {setCurrencyCookie} from '@/features/currency/currency';
import {getActiveChannelCached} from '@/platform/vendure/channel';
import {updateTag} from 'next/cache';

export async function switchCurrency(currencyCode: string) {
    const channel = await getActiveChannelCached();
    if (!(channel.availableCurrencyCodes as string[]).includes(currencyCode)) {
        throw new Error('Invalid currency code');
    }

    await setCurrencyCookie(currencyCode);

    updateTag('products');
    updateTag('collection');
    updateTag('cart');
    updateTag('active-order');
}
