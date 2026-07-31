import NextLink from 'next/link';
import {getRouteLocale} from '@/platform/i18n/server';
import {ComponentProps} from 'react';

type NavigationLinkProps = Omit<ComponentProps<typeof NextLink>, 'href'> & {
    href: string;
};

/**
 * Locale-aware link for cached/static server components (layout, navbar, footer).
 *
 * Uses next/link with rootLocale() to build locale-prefixed hrefs.
 * next-intl's Link always calls useLocale() internally which accesses
 * dynamic data and breaks PPR prerendering on routes with dynamic params.
 *
 * For client components, use Link from @/platform/i18n/navigation instead.
 */
export async function NavigationLink({href, ...rest}: NavigationLinkProps) {
    const locale = await getRouteLocale();
    const localizedHref = href === '/' ? `/${locale}` : `/${locale}${href}`;
    return <NextLink href={localizedHref} {...rest} />;
}
