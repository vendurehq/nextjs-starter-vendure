import { Suspense } from 'react';
import { mutate } from '@/platform/vendure/api';
import {UpdateCustomerEmailAddressMutation} from '@/features/account/graphql';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/platform/i18n/navigation';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';

async function VerifyEmailContent({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Account'});
    const resolvedParams = await searchParams;
    const tokenParam = resolvedParams.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

    if (!token) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>{t('verifyEmail.invalidLink')}</CardTitle>
                    <CardDescription>
                        {t('verifyEmail.invalidLinkDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('verifyEmail.checkEmail')}
                    </p>
                    <Button render={<Link href="/account/profile" />} nativeButton={false}>{t('verifyEmail.goToProfile')}</Button>
                </CardContent>
            </Card>
        );
    }

    try {
        const result = await mutate(UpdateCustomerEmailAddressMutation, { token: token! }, { useAuthToken: true });
        const updateResult = result.data.updateCustomerEmailAddress;

        if (updateResult.__typename === 'Success') {
            return (
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>{t('verifyEmail.success')}</CardTitle>
                        <CardDescription>
                            {t('verifyEmail.successDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('verifyEmail.successMessage')}
                        </p>
                        <Button render={<Link href="/account/profile" />} nativeButton={false}>{t('verifyEmail.goToProfile')}</Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>{t('verifyEmail.failed')}</CardTitle>
                    <CardDescription>
                        {updateResult.message || t('verifyEmail.failedDefault')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('verifyEmail.failedMessage')}
                    </p>
                    <Button render={<Link href="/account/profile" />} nativeButton={false}>{t('verifyEmail.goToProfile')}</Button>
                </CardContent>
            </Card>
        );
    } catch {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>{t('verifyEmail.error')}</CardTitle>
                    <CardDescription>
                        {t('verifyEmail.errorDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('verifyEmail.errorMessage')}
                    </p>
                    <Button render={<Link href="/account/profile" />} nativeButton={false}>{t('verifyEmail.goToProfile')}</Button>
                </CardContent>
            </Card>
        );
    }
}

export default async function VerifyEmailPage({searchParams}: PageProps<'/[locale]/account/verify-email'>) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Account'});

    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <Suspense fallback={
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>{t('verifyEmail.verifying')}</CardTitle>
                        <CardDescription>
                            {t('verifyEmail.verifyingDesc')}
                        </CardDescription>
                    </CardHeader>
                </Card>
            }>
                <VerifyEmailContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
