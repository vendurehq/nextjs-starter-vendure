export type AddressFieldPolicy = 'required' | 'optional' | 'hidden';

export type AddressFieldKey =
    | 'fullName'
    | 'company'
    | 'streetLine1'
    | 'streetLine2'
    | 'city'
    | 'province'
    | 'postalCode'
    | 'countryCode'
    | 'phoneNumber';

export interface StorefrontLocaleConfig {
    locales: readonly [string, ...string[]];
    defaultLocale: string;
    localeNames: Record<string, string>;
    intlLocales: Record<string, string>;
    ogLocales: Record<string, string>;
}

export interface StorefrontLink {
    labelKey: string;
    href: string;
    external?: boolean;
}

export interface StorefrontLogoConfig {
    src: string;
    alt: string;
    width: number;
    height: number;
}

export interface StorefrontFeature {
    key: string;
    icon: string;
}

export interface StorefrontConfig {
    site: {
        name: string;
        url: string;
        logo: StorefrontLogoConfig;
    };
    i18n: StorefrontLocaleConfig;
    catalog: {
        productsPerPage: number;
        topCollectionsParentId: string;
    };
    navigation: {
        footerCustomerLinks: StorefrontLink[];
        footerResourceLinks: StorefrontLink[];
        showPoweredBy: boolean;
        copyrightYear: number;
    };
    home: {
        features: StorefrontFeature[];
    };
    product: {
        trustBadges: StorefrontFeature[];
        faqKeys: string[];
    };
    checkout: {
        payment: {
            standardMethodCode: string;
            standardPaymentMetadata: Record<string, unknown>;
        };
        addressFields: Record<AddressFieldKey, AddressFieldPolicy>;
    };
}

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends readonly unknown[]
        ? T[K]
        : T[K] extends (...args: never[]) => unknown
            ? T[K]
            : T[K] extends object
                ? DeepPartial<T[K]>
                : T[K];
};
