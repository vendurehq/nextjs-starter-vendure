import type { DeepPartial, StorefrontConfig } from '@/lib/storefront/schema';

export const storefrontConfig = {
    site: {
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
        logo: {
            src: '/vendure.svg',
            alt: 'Vendure',
            width: 40,
            height: 27,
        },
    },
} satisfies DeepPartial<StorefrontConfig>;
