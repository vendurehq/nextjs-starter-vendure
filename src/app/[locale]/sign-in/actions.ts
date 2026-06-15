'use server';

import {
    loginAction as sharedLoginAction,
    logoutAction as sharedLogoutAction,
} from '@/lib/commerce/actions/auth';

export async function loginAction(prevState: { error?: string } | undefined, formData: FormData) {
    return sharedLoginAction(prevState, formData);
}

export async function logoutAction() {
    return sharedLogoutAction();
}
