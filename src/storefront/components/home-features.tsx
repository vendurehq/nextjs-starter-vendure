import {BadgeCheck, Tag, Zap} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {storefront} from '@/lib/storefront/config';

const featureIcons: Record<string, LucideIcon> = {
    'badge-check': BadgeCheck,
    tag: Tag,
    zap: Zap,
};

export async function HomeFeatures() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});
    const translate = t as (key: string) => string;

    return (
        <section className="py-16 md:py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center mb-12">
                    {t('whyShopWithUs')}
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {storefront.home.features.map((feature) => {
                        const Icon = featureIcons[feature.icon] ?? BadgeCheck;

                        return (
                            <div
                                key={feature.key}
                                className="group relative text-center space-y-4 rounded-xl border border-transparent bg-card p-8 transition-all duration-300 hover:border-border hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/20">
                                    <Icon className="size-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">{translate(`features.${feature.key}.title`)}</h3>
                                <p className="text-muted-foreground leading-relaxed">{translate(`features.${feature.key}.description`)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
