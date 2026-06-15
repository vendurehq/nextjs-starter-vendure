import {defineRouting} from 'next-intl/routing';
import {storefront} from '@/lib/storefront/config';

export const routing = defineRouting({
    locales: storefront.i18n.locales,
    defaultLocale: storefront.i18n.defaultLocale,
});

export type Locale = (typeof routing.locales)[number];

export const localeNames: Record<string, string> = storefront.i18n.localeNames;
