'use client';

import {use, useEffect, useRef, useState} from 'react';
import {VerifyResult, type VerifyResultValue} from './verify-result';
import {VerifyLoading} from './verify-loading';
import {verifyAccountAction} from './actions';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import { Link } from '@/platform/i18n/navigation';
import {XCircle} from 'lucide-react';
import {useTranslations} from 'next-intl';

interface VerifyContentProps {
    searchParams: Promise<{ token?: string }>;
}

export function VerifyContent({searchParams}: VerifyContentProps) {
    const t = useTranslations('Verify');
    const params = use(searchParams);
    const token = params.token;
    // A verification token is single-use, so guard against React's development
    // effect replay submitting the same one twice.
    const requestedToken = useRef<string | undefined>(undefined);
    const [result, setResult] = useState<VerifyResultValue>();

    useEffect(() => {
        if (!token || requestedToken.current === token) return;
        requestedToken.current = token;

        // The action reports its own failures; this rejects only when the
        // request itself cannot complete.
        verifyAccountAction(token).then(setResult, () => setResult({error: ''}));
    }, [token]);

    if (!token) {
        return (
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                        <XCircle className="h-16 w-16 text-destructive"/>
                    </div>
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-bold">{t('invalidLink')}</h1>
                        <p className="text-muted-foreground">
                            {t('invalidLinkMessage')}
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
                </CardContent>
            </Card>
        );
    }

    return result ? <VerifyResult result={result}/> : <VerifyLoading/>;
}
