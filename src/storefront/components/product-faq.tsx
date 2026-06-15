import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {getTranslations} from 'next-intl/server';
import {getRouteLocale} from '@/i18n/server';
import {storefront} from '@/lib/storefront/config';

export async function ProductFaq() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Product'});
    const translate = t as (key: string) => string;

    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-2xl">
                <h2 className="text-2xl font-bold text-center mb-8">{t('faq.title')}</h2>
                <Accordion className="w-full">
                    {storefront.product.faqKeys.map((key) => (
                        <AccordionItem key={key} value={key}>
                            <AccordionTrigger>{translate(`faq.${key}.question`)}</AccordionTrigger>
                            <AccordionContent>
                                {translate(`faq.${key}.answer`)}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
