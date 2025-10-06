'use server';

import { mutate } from '@/lib/vendure/api';
import { LoginMutation } from '@/lib/vendure/mutations';
import { setAuthToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    try {
        const result = await mutate(LoginMutation, {
            username,
            password,
        });

        const loginResult = result.data.login;

        if (loginResult.__typename !== 'CurrentUser') {
            return { error: loginResult.message };
        }

        // Store the token in a cookie if returned
        if (result.token) {
            await setAuthToken(result.token);
        }

        redirect('/');
    } catch (error: any) {
        if (error.message === "NEXT_REDIRECT") throw error;
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
