'use client';

import {Card, CardContent} from '@/components/ui/card';
import {Loader2} from 'lucide-react';
import {useTranslations} from 'next-intl';

export function VerifyLoading() {
    const t = useTranslations('Verify');

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex justify-center">
                    <Loader2 className="h-16 w-16 text-primary animate-spin"/>
                </div>
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">{t('verifyingAccount')}</h1>
                    <p className="text-muted-foreground">
                        {t('verifyingAccountMessage')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
