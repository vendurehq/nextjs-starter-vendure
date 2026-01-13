'use server';

import {mutate} from '@/lib/vendure/api';
import {LoginMutation, LogoutMutation} from '@/lib/vendure/mutations';
import {removeAuthToken, setAuthToken} from '@/lib/auth';
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string | null;

    const result = await mutate(LoginMutation, {
        username,
        password,
    }, { useAuthToken: true });

    const loginResult = result.data.login;

    if (loginResult.__typename !== 'CurrentUser') {
        if (loginResult.__typename === 'NotVerifiedError') {
            return { error: 'Please verify your email address before signing in.' };
        }
        return { error: 'Invalid email or password.' };
    }

    // Store the token in a cookie if returned
    if (result.token) {
        await setAuthToken(result.token);
    }

    revalidatePath('/', 'layout');

    // Validate redirectTo is a safe internal path
    const safeRedirect = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/';

    redirect(safeRedirect);

}

export async function logoutAction() {
    await mutate(LogoutMutation);
    await removeAuthToken();

    redirect('/')
}
