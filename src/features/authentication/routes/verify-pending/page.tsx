import type {Metadata} from 'next';
import {Suspense} from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/platform/i18n/navigation';
import { CheckCircle } from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';

export const metadata: Metadata = {
    title: 'Verification Pending',
    description: 'Check your email to verify your account.',
};

async function VerifyPendingContent({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Verify'});
    const resolvedParams = await searchParams;
    const redirectTo = resolvedParams?.redirectTo as string | undefined;

    const signInHref = redirectTo
        ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/sign-in';

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">{t('pending.title')}</h1>
                    <p className="text-muted-foreground">
                        {t('pending.message')}
                    </p>
                </div>
                <div className="bg-muted p-4 rounded-md">
                    <p className="text-sm text-muted-foreground">
                        {t('pending.spamNote')}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
                <Link href={signInHref} className="w-full">
                    <Button className="w-full">
                        {t('pending.goToSignIn')}
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

export default async function VerifyPendingPage({searchParams}: PageProps<'/[locale]/verify-pending'>) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Verify'});
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md space-y-6">
                <Suspense fallback={<div>{t('loading')}</div>}>
                    <VerifyPendingContent searchParams={searchParams} />
                </Suspense>
            </div>
        </div>
    );
}
