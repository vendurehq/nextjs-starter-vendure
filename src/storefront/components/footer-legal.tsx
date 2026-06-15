import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {storefront} from '@/lib/storefront/config';

export async function FooterLegal() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Footer'});

    return (
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
                &copy; {storefront.navigation.copyrightYear} {t('copyright')}
            </div>
            {storefront.navigation.showPoweredBy && (
                <div className="flex items-center gap-2">
                    <span>{t('poweredBy')}</span>
                    <a
                        href="https://vendure.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        <Image src="/vendure.svg" alt="Vendure" width={40} height={27} className="h-4 w-auto dark:invert" />
                    </a>
                    <span>&</span>
                    <a
                        href="https://nextjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        <Image src="/next.svg" alt="Next.js" width={16} height={16} className="h-5 w-auto dark:invert" />
                    </a>
                </div>
            )}
        </div>
    );
}
