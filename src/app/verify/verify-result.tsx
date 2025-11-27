'use client';

import {use} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import Link from 'next/link';
import {CheckCircle, XCircle} from 'lucide-react';

type VerifyResultType = {success: boolean; error?: undefined} | {error: string; success?: undefined};

interface VerifyResultProps {
    resultPromise: Promise<VerifyResultType>;
}

export function VerifyResult({resultPromise}: VerifyResultProps) {
    const result = use(resultPromise);

    const isSuccess = 'success' in result;

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                {isSuccess ? (
                    <>
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-600"/>
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">Account Verified!</h1>
                            <p className="text-muted-foreground">
                                Your email has been successfully verified. You can now sign in to your account.
                            </p>
                        </div>
                        <Link href="/sign-in" className="block">
                            <Button className="w-full">
                                Sign In
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="flex justify-center">
                            <XCircle className="h-16 w-16 text-destructive"/>
                        </div>
                        <div className="space-y-2 text-center">
                            <h1 className="text-2xl font-bold">Verification Failed</h1>
                            <p className="text-muted-foreground">
                                {result.error || 'Unable to verify your account. The verification link may have expired.'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Link href="/register" className="block">
                                <Button variant="outline" className="w-full">
                                    Create New Account
                                </Button>
                            </Link>
                            <Link href="/sign-in" className="block">
                                <Button variant="ghost" className="w-full">
                                    Back to Sign In
                                </Button>
                            </Link>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
