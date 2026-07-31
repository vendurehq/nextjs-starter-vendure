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
    // Verification tokens are single-use. Cache each request so effect replay
    // or returning to a previously seen token cannot submit it twice.
    const requests = useRef(new Map<string, Promise<VerifyResultValue>>());
    const [settled, setSettled] = useState<{token: string; result: VerifyResultValue}>();

    useEffect(() => {
        if (!token) return;

        let request = requests.current.get(token);
        if (!request) {
            // The action reports its own failures; this rejects only when the
            // request itself fails to complete.
            request = verifyAccountAction(token).catch(
                (): VerifyResultValue => ({error: ''}),
            );
            requests.current.set(token, request);
        }

        let active = true;
        request.then(result => {
            if (active) setSettled({token, result});
        });
        return () => {
            active = false;
        };
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

    return settled?.token === token
        ? <VerifyResult result={settled.result}/>
        : <VerifyLoading/>;
}
