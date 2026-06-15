'use server';

import {removeAuthToken, setAuthToken} from '@/lib/auth';
import {redirect} from '@/i18n/navigation';
import {mutate} from '@/lib/vendure/api';
import {LoginMutation, LogoutMutation} from '@/lib/vendure/mutations';
import {revalidatePath} from 'next/cache';
import {getLocale, getTranslations} from 'next-intl/server';

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
    const t = await getTranslations('Errors');
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string | null;

    const result = await mutate(LoginMutation, {
        username,
        password,
    }, {useAuthToken: true});

    const loginResult = result.data.login;

    if (loginResult.__typename !== 'CurrentUser') {
        if (loginResult.__typename === 'NotVerifiedError') {
            return {error: t('verifyEmailFirst')};
        }
        return {error: t('invalidCredentials')};
    }

    if (result.token) {
        await setAuthToken(result.token);
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}`, 'layout');

    const safeRedirect = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
        ? redirectTo
        : '/';

    redirect({href: safeRedirect, locale});
}

export async function logoutAction() {
    await mutate(LogoutMutation);
    await removeAuthToken();

    const locale = await getLocale();
    redirect({href: '/', locale});
}
