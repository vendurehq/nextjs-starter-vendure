import {Button} from "@/components/ui/button";
import { Link } from '@/platform/i18n/navigation';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/platform/i18n/server';

export async function HeroSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Hero'});
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-muted">
            {/* Subtle decorative grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
            {/* Radial fade overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--color-primary)/8,transparent)]" />

            <div className="container relative mx-auto px-4 py-28 md:py-40 lg:py-48">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight animate-in fade-in slide-in-from-top-4 duration-700 fill-mode-backwards"
                    >
                        {t('title')}{" "}
                        <span className="text-primary">{t('titleHighlight')}</span>
                    </h1>
                    <p
                        className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards"
                    >
                        {t('subtitle')}
                    </p>
                    <div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards"
                    >
                        <Button render={<Link href="/search" />} nativeButton={false} size="lg" className="min-w-[200px] text-base">
                            {t('shopNow')}
                        </Button>
                        <Button render={<Link href="/search" />} nativeButton={false} variant="outline" size="lg" className="min-w-[200px] text-base">
                            {t('viewCollections')}
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
