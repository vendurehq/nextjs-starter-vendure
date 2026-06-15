import {Clock, RotateCcw, ShieldCheck, Truck} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {storefront} from '@/lib/storefront/config';

const trustBadgeIcons: Record<string, LucideIcon> = {
    clock: Clock,
    'rotate-ccw': RotateCcw,
    'shield-check': ShieldCheck,
    truck: Truck,
};

export async function ProductTrustBadges() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Product'});
    const translate = t as (key: string) => string;

    return (
        <section className="py-8 mt-8 border-y border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
                    {storefront.product.trustBadges.map((badge) => {
                        const Icon = trustBadgeIcons[badge.icon] ?? Truck;

                        return (
                            <div
                                key={badge.key}
                                className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-4 py-2 text-sm font-medium text-muted-foreground"
                            >
                                <Icon className="h-4 w-4 text-primary" />
                                {translate(`trustBadges.${badge.key}`)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
