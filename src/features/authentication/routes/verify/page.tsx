import type {Metadata} from 'next';
import {Suspense} from 'react';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';
import {VerifyLoading} from './verify-loading';
import {VerifyContent} from './verify-content';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Verify'});
    return {
        title: t('pageTitle'),
        description: t('pageDescription'),
    };
}

export default function VerifyPage({searchParams}: PageProps<'/[locale]/verify'>) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <Suspense fallback={<VerifyLoading/>}>
                    <VerifyContent searchParams={searchParams}/>
                </Suspense>
            </div>
        </div>
    );
}
