import {getRouteLocale} from '@/i18n/server';
import {cacheLife, cacheTag} from 'next/cache';
import {getTopCollections} from '@/lib/vendure/cached';
import {NavigationLink} from '@/components/shared/navigation-link';
import {getTranslations} from 'next-intl/server';
import {storefront} from '@/lib/storefront/config';
import {StorefrontLogo} from '@/storefront/components/logo';
import {FooterLegal} from '@/storefront/components/footer-legal';
import type {ReactNode} from 'react';

export async function Footer() {
    'use cache'
    cacheLife('days');

    const locale = await getRouteLocale();
    cacheTag(`footer-${locale}`);

    const t = await getTranslations({locale, namespace: 'Footer'});
    const translate = t as (key: string) => string;
    const collections = await getTopCollections(locale);

    return (
        <footer className="border-t border-border mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <NavigationLink href="/" className="inline-block mb-4">
                            <StorefrontLogo />
                        </NavigationLink>
                        <p className="text-sm text-muted-foreground text-balance leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('categories')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {collections.map((collection) => (
                                <li key={collection.id}>
                                    <NavigationLink
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-foreground transition-colors"
                                    >
                                        {collection.name}
                                    </NavigationLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('customer')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {storefront.navigation.footerCustomerLinks.map((link) => (
                                <FooterLink key={link.href} href={link.href} external={link.external}>
                                    {translate(link.labelKey)}
                                </FooterLink>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">{t('vendure')}</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {storefront.navigation.footerResourceLinks.map((link) => (
                                <FooterLink key={link.href} href={link.href} external={link.external}>
                                    {translate(link.labelKey)}
                                </FooterLink>
                            ))}
                        </ul>
                    </div>
                </div>

                <FooterLegal />
            </div>
        </footer>
    );
}

function FooterLink({
    href,
    external,
    children,
}: {
    href: string;
    external?: boolean;
    children: ReactNode;
}) {
    if (external) {
        return (
            <li>
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                >
                    {children}
                </a>
            </li>
        );
    }

    return (
        <li>
            <NavigationLink href={href} className="hover:text-foreground transition-colors">
                {children}
            </NavigationLink>
        </li>
    );
}
