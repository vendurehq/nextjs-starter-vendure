import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { mutate } from '@core/lib/vendure/api';
import { UpdateCustomerEmailAddressMutation } from '@core/lib/vendure/mutations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function VerifyEmailContent({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
    const resolvedParams = await searchParams;
    const tokenParam = resolvedParams.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

    if (!token) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Invalid Verification Link</CardTitle>
                    <CardDescription>
                        The verification link is missing or invalid.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Please check your email for the correct verification link, or request a new one from your profile page.
                    </p>
                    <Button asChild>
                        <Link href="/account/profile">Go to Profile</Link>
                    </Button>
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
                        <CardTitle>Email Verified!</CardTitle>
                        <CardDescription>
                            Your email address has been updated successfully.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Your email address has been changed. You can now use your new email address to sign in.
                        </p>
                        <Button asChild>
                            <Link href="/account/profile">Go to Profile</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Verification Failed</CardTitle>
                    <CardDescription>
                        {updateResult.message || 'Unable to verify your email address.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        The verification link may have expired or already been used. Please request a new verification email from your profile page.
                    </p>
                    <Button asChild>
                        <Link href="/account/profile">Go to Profile</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    } catch (error) {
        return (
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Verification Error</CardTitle>
                    <CardDescription>
                        An unexpected error occurred during verification.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Please try again later or contact support if the problem persists.
                    </p>
                    <Button asChild>
                        <Link href="/account/profile">Go to Profile</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }
}

export default async function VerifyEmailPage({searchParams}: PageProps<'/account/verify-email'>) {
    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <Suspense fallback={
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Verifying Email...</CardTitle>
                        <CardDescription>
                            Please wait while we verify your email address.
                        </CardDescription>
                    </CardHeader>
                </Card>
            }>
                <VerifyEmailContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
