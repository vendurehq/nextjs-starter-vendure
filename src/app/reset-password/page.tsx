import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ResetPasswordForm } from './reset-password-form';

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-md mx-auto">
                <Suspense fallback={
                    <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                }>
                    <ResetPasswordForm searchParams={searchParams} />
                </Suspense>
            </div>
        </div>
    );
}
