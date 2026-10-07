import {AlertCircle, Clock, Info, MessageCircleQuestion, SearchX} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from '@/components/ui/empty';
import {Skeleton} from '@/components/ui/skeleton';
import {ProductCardFragment} from '@/features/products/graphql';
import {ProductCard} from '@/features/products/product-card';
import {Price} from '@/features/pricing/price';
import {Link} from '@/platform/i18n/navigation';
import {maskFragments} from '@/platform/vendure/graphql';
import type {AssistantCriterion, AssistantState, CurrencyNotice} from '../assistant-view';
import {MAX_REQUEST_LENGTH} from '../intent-extraction';

const GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

function searchHref(query: string) {
    return `/search?q=${encodeURIComponent(query)}`;
}

export function AssistantResultsSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-5 w-40"/>
            <div className={GRID_CLASS}>
                {Array.from({length: 3}).map((_, i) => (
                    <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                        <Skeleton className="aspect-square rounded-none"/>
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-5 w-3/4"/>
                            <Skeleton className="h-6 w-1/2"/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AssistantResults({state}: { state: AssistantState }) {
    const t = useTranslations('ShoppingAssistant');

    switch (state.status) {
        case 'idle':
            return null;

        case 'invalid_request':
            return <p className="text-center text-sm text-destructive">{t('invalidRequest', {max: MAX_REQUEST_LENGTH})}</p>;

        case 'rate_limited':
            return (
                <Alert className="max-w-2xl mx-auto">
                    <Clock aria-hidden/>
                    <AlertTitle>{t('rateLimitedTitle')}</AlertTitle>
                    <AlertDescription>{t('rateLimitedDescription')}</AlertDescription>
                </Alert>
            );

        case 'unavailable':
            return (
                <Alert variant="destructive" className="max-w-2xl mx-auto">
                    <AlertCircle aria-hidden/>
                    <AlertTitle>{t('unavailableTitle')}</AlertTitle>
                    <AlertDescription>
                        <p>{t('unavailableDescription')}</p>
                        <Link href={searchHref(state.text)} className="underline underline-offset-4 hover:text-primary">
                            {t('searchInstead')}
                        </Link>
                    </AlertDescription>
                </Alert>
            );

        case 'no_criteria':
            return (
                <div className="space-y-4">
                    <CurrencyAlert notice={state.currencyNotice}/>
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><MessageCircleQuestion/></EmptyMedia>
                            <EmptyTitle>{t('noCriteriaTitle')}</EmptyTitle>
                            <EmptyDescription>{t('noCriteriaDescription', {example: t('examples.laptopRam')})}</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                </div>
            );

        case 'results':
            return (
                <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">{t('resultCount', {count: state.products.length})}</p>
                        {state.criteria.length > 0 && (
                            <ul className="flex flex-wrap gap-2" aria-label={t('criteriaLabel')}>
                                {state.criteria.map((criterion, i) => (
                                    <li key={i}><Badge variant="secondary"><CriterionLabel criterion={criterion}/></Badge></li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {state.unverifiedAttributes.length > 0 && (
                        <Alert>
                            <Info aria-hidden/>
                            <AlertDescription>
                                {t('unverified', {
                                    attributes: state.unverifiedAttributes.map(a => `${a.name}: ${a.value}`).join(', '),
                                })}
                            </AlertDescription>
                        </Alert>
                    )}
                    <CurrencyAlert notice={state.currencyNotice}/>

                    {state.products.length === 0 ? (
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon"><SearchX/></EmptyMedia>
                                <EmptyTitle>{t('noResultsTitle')}</EmptyTitle>
                                <EmptyDescription>{t('noResultsDescription')}</EmptyDescription>
                            </EmptyHeader>
                            {state.searchQuery && (
                                <EmptyContent>
                                    <Button variant="outline" render={<Link href={searchHref(state.searchQuery)}/>} nativeButton={false}>
                                        {t('browseSearch')}
                                    </Button>
                                </EmptyContent>
                            )}
                        </Empty>
                    ) : (
                        <div className={GRID_CLASS}>
                            {state.products.map(product => (
                                <div key={product.card.productId} className="space-y-2">
                                    <ProductCard product={maskFragments([ProductCardFragment], product.card)}/>
                                    {product.matchingVariants.length > 0 && (
                                        <p className="px-1 text-xs text-muted-foreground">
                                            {t('matchingVariants', {variants: product.matchingVariants.join(', ')})}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {state.truncated && state.searchQuery && state.products.length > 0 && (
                        <div className="flex justify-center">
                            <Link href={searchHref(state.searchQuery)} className="text-sm font-medium text-primary hover:underline underline-offset-4">
                                {t('seeAll')}
                            </Link>
                        </div>
                    )}
                </div>
            );
    }
}

function CriterionLabel({criterion}: { criterion: AssistantCriterion }) {
    const t = useTranslations('ShoppingAssistant');
    switch (criterion.type) {
        case 'query':
            return <>{t('criteria.query', {query: criterion.value})}</>;
        case 'minPrice':
            return <>{t('criteria.minPrice')} <Price value={criterion.value} currencyCode={criterion.currencyCode}/></>;
        case 'maxPrice':
            return <>{t('criteria.maxPrice')} <Price value={criterion.value} currencyCode={criterion.currencyCode}/></>;
        case 'collection':
            return <>{t('criteria.collection', {collection: criterion.value})}</>;
        case 'attribute':
            return <>{criterion.name}: {criterion.value}</>;
        case 'sort':
            return <>{t(`criteria.sort.${criterion.value.by}${criterion.value.order === 'ASC' ? 'Asc' : 'Desc'}`)}</>;
    }
}

function CurrencyAlert({notice}: { notice: CurrencyNotice | null }) {
    const t = useTranslations('ShoppingAssistant');
    if (!notice) return null;
    return (
        <Alert>
            <Info aria-hidden/>
            <AlertDescription>{t('currencyMismatch', {requested: notice.requested, active: notice.active})}</AlertDescription>
        </Alert>
    );
}
