import type {RoutePageProps} from '@/platform/next/route-types';
import type {Metadata} from 'next';
import {Suspense} from 'react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';
import {OrderConfirmation} from './order-confirmation';
import {noIndexRobots} from '@/site/metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'OrderConfirmation'});
    return {
        title: t('pageTitle'),
        robots: noIndexRobots(),
    };
}

export default async function OrderConfirmationPage(props: RoutePageProps<{locale: string; code: string}>) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Common'});

    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">{t('loading')}</div>}>
            <OrderConfirmation paramsPromise={props.params} />
        </Suspense>
    );
}
