import type { StorefrontConfig } from './schema';

export const defaultStorefrontConfig: StorefrontConfig = {
    site: {
        name: process.env.NEXT_PUBLIC_SITE_NAME || 'Vendure Store',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
        logo: {
            src: '/vendure.svg',
            alt: 'Vendure',
            width: 40,
            height: 27,
        },
    },
    i18n: {
        locales: ['en', 'de'],
        defaultLocale: 'en',
        localeNames: {
            en: 'English',
            de: 'Deutsch',
        },
        intlLocales: {
            en: 'en-US',
            de: 'de-DE',
        },
        ogLocales: {
            en: 'en_US',
            de: 'de_DE',
        },
    },
    catalog: {
        productsPerPage: 12,
        topCollectionsParentId: '1',
    },
    navigation: {
        footerCustomerLinks: [
            { labelKey: 'shopAll', href: '/search' },
            { labelKey: 'orders', href: '/account/orders' },
            { labelKey: 'account', href: '/account/profile' },
        ],
        footerResourceLinks: [
            { labelKey: 'github', href: 'https://github.com/vendure-ecommerce', external: true },
            { labelKey: 'documentation', href: 'https://docs.vendure.io', external: true },
            { labelKey: 'sourceCode', href: 'https://github.com/vendure-ecommerce/vendure', external: true },
        ],
        showPoweredBy: true,
        copyrightYear: 2026,
    },
    home: {
        features: [
            { icon: 'badge-check', key: 'highQuality' },
            { icon: 'tag', key: 'bestPrices' },
            { icon: 'zap', key: 'fastDelivery' },
        ],
    },
    product: {
        trustBadges: [
            { icon: 'truck', key: 'fastShipping' },
            { icon: 'rotate-ccw', key: 'freeReturns' },
            { icon: 'shield-check', key: 'secureCheckout' },
            { icon: 'clock', key: 'guarantee' },
        ],
        faqKeys: ['shipping', 'returns', 'tracking', 'international'],
    },
    checkout: {
        payment: {
            standardMethodCode: 'standard-payment',
            standardPaymentMetadata: {
                shouldDecline: false,
                shouldError: false,
                shouldErrorOnSettle: false,
            },
        },
        addressFields: {
            fullName: 'required',
            company: 'optional',
            streetLine1: 'required',
            streetLine2: 'optional',
            city: 'required',
            province: 'optional',
            postalCode: 'required',
            countryCode: 'required',
            phoneNumber: 'required',
        },
    },
};
