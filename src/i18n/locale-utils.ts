import {storefront} from '@/lib/storefront/config';

export function toOgLocale(locale: string): string {
    return storefront.i18n.ogLocales[locale] || storefront.i18n.ogLocales[storefront.i18n.defaultLocale] || 'en_US';
}

export function toIntlLocale(locale: string): string {
    return storefront.i18n.intlLocales[locale] || storefront.i18n.intlLocales[storefront.i18n.defaultLocale] || 'en-US';
}
