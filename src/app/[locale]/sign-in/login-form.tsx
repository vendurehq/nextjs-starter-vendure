'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginAction, undefined);

    return (
        <Card>
            <form action={formAction}>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="username">Email</Label>
                        <Input
                            id="username"
                            name="username"
                            type="email"
                            placeholder="you@example.com"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
                    </div>
                    {state?.error && (
                        <div className="text-sm text-destructive">
                            {state.error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <div className="text-sm text-center space-y-2">
                        <Link
                            href="/reset-password"
                            className="text-muted-foreground hover:text-primary"
                        >
                            Forgot password?
                        </Link>
                        <div className="text-muted-foreground">
                            Don't have an account?{' '}
                            <Link href="/register" className="hover:text-primary">
                                Register
                            </Link>
                        </div>
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
