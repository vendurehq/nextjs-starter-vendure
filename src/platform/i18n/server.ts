import {locale as rootLocale} from 'next/root-params';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

/**
 * Safe wrapper around rootLocale() that validates against routing config
 * and falls back to defaultLocale instead of returning undefined.
 *
 * Use this in server components, generateMetadata, and 'use cache' functions.
 * Server actions should use getLocale() from next-intl/server instead,
 * since they run outside the cached RSC tree and have full request context.
 */
export async function getRouteLocale(): Promise<string> {
    const loc = await rootLocale();
    return hasLocale(routing.locales, loc) ? loc : routing.defaultLocale;
}
