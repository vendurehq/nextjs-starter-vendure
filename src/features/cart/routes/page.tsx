import type {Metadata} from 'next';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';
import {Cart} from "@/features/cart/routes/cart";
import {Suspense} from "react";
import {CartSkeleton} from "@/features/cart/components/cart-skeleton";
import {noIndexRobots} from '@/config/metadata';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Cart'});
    return {
        title: t('title'),
        robots: noIndexRobots(),
    };
}

export default async function CartPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Cart'});

    return (
        <div className="container mx-auto px-4 py-20">
            <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

            <Suspense fallback={<CartSkeleton />}>
                <Cart/>
            </Suspense>
        </div>
    );
}
