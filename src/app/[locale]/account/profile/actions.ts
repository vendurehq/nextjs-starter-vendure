'use server';

import {
    requestEmailUpdateAction as sharedRequestEmailUpdateAction,
    updateCustomerAction as sharedUpdateCustomerAction,
    updatePasswordAction as sharedUpdatePasswordAction,
} from '@/lib/commerce/actions/account';

type AccountActionState = { error?: string; success?: boolean } | undefined;

export async function updatePasswordAction(prevState: AccountActionState, formData: FormData) {
    return sharedUpdatePasswordAction(prevState, formData);
}

export async function updateCustomerAction(prevState: AccountActionState, formData: FormData) {
    return sharedUpdateCustomerAction(prevState, formData);
}

export async function requestEmailUpdateAction(prevState: AccountActionState, formData: FormData) {
    return sharedRequestEmailUpdateAction(prevState, formData);
}
