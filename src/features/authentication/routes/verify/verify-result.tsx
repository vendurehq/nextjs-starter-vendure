'use client';

import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import { Link } from '@/platform/i18n/navigation';
import {CheckCircle, XCircle} from 'lucide-react';
import {useTranslations} from 'next-intl';

export type VerifyResultValue = {success: boolean; error?: undefined} | {error: string; success?: undefined};

interface VerifyResultProps {
    result: VerifyResultValue;
}

export function VerifyResult({result}: VerifyResultProps) {
    const t = useTranslations('Verify');

    const isSuccess = result.success === true;

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {isSuccess ? (
                    <>
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-600"/>
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">{t('accountVerified')}</h1>
                            <p className="text-muted-foreground">
                                {t('accountVerifiedMessage')}
                            </p>
                        </div>
                        <Link href="/sign-in" className="block">
                            <Button className="w-full">
                                {t('backToSignIn')}
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center">
                            <XCircle className="h-16 w-16 text-destructive"/>
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">{t('verificationFailed')}</h1>
                            <p className="text-muted-foreground">
                                {result.error || t('verificationFailedMessage')}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link href="/register" className="block">
                                <Button variant="outline" className="w-full">
                                    {t('createNewAccount')}
                                </Button>
                            </Link>
                            <Link href="/sign-in" className="block">
                                <Button variant="ghost" className="w-full">
                                    {t('backToSignIn')}
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
