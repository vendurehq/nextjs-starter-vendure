import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Card, CardContent} from '@/components/ui/card';
import {Loader2} from 'lucide-react';
import {VerifyContent} from './verify-content';

export const metadata: Metadata = {
    title: 'Verify Email',
    description: 'Verify your email address to complete registration.',
};

function VerifyLoading() {
    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex justify-center">
                    <Loader2 className="h-16 w-16 text-primary animate-spin"/>
                </div>
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Verifying Your Account</h1>
                    <p className="text-muted-foreground">
                        Please wait while we verify your email address...
                    </p>
                </div>
            </CardContent>
        </Card>
    );
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
