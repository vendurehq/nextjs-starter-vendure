'use server';

import {getLocale} from 'next-intl/server';
import {getActiveCurrencyCode} from '@/features/currency/currency-server';
import {findProductsForRequest} from './assistant';
import {toAssistantState, type AssistantState} from './assistant-view';
import {MAX_REQUEST_LENGTH} from './intent-extraction';
import {createRateLimiter} from './rate-limit';

// Protects the free model quota in this process only; see rate-limit.ts before deploying at scale.
const allowRequest = createRateLimiter({limit: 10, windowMs: 60_000});

export async function askShoppingAssistant(_previousState: AssistantState, formData: FormData): Promise<AssistantState> {
    const value = formData.get('request');
    const text = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
    if (!text || text.length > MAX_REQUEST_LENGTH) return {status: 'invalid_request', text};
    if (!allowRequest()) return {status: 'rate_limited', text};

    try {
        const [languageCode, currencyCode] = await Promise.all([getLocale(), getActiveCurrencyCode()]);
        const result = await findProductsForRequest(text, {languageCode, currencyCode});
        return toAssistantState(result, {text, currencyCode});
    } catch (error) {
        console.error('Shopping assistant request failed:', error);
        return {status: 'unavailable', text};
    }
}
