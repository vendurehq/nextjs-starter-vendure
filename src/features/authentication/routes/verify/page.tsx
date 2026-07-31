import type {Metadata} from 'next';
import {Suspense} from 'react';
import {VerifyLoading} from './verify-loading';
import {VerifyContent} from './verify-content';

export const metadata: Metadata = {
    title: 'Verify Email',
    description: 'Verify your email address to complete registration.',
};

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
