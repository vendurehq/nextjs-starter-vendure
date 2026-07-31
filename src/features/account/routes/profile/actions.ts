'use server';

import {mutate} from '@/platform/vendure/api';
import {UpdateCustomerPasswordMutation, UpdateCustomerMutation, RequestUpdateCustomerEmailAddressMutation} from '@/features/account/graphql';
import {revalidatePath} from 'next/cache';
import {getLocale, getTranslations} from 'next-intl/server';

export async function updatePasswordAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const t = await getTranslations('Errors');
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return {error: t('fieldsRequired')};
    }

    if (newPassword !== confirmPassword) {
        return {error: t('passwordsMismatch')};
    }

    if (currentPassword === newPassword) {
        return {error: t('newPasswordMustDiffer')};
    }

    try {
        const result = await mutate(UpdateCustomerPasswordMutation, {
            currentPassword,
            newPassword,
        }, {useAuthToken: true});

        const updateResult = result.data.updateCustomerPassword;

        if (updateResult.__typename !== 'Success') {
            return {error: updateResult.message};
        }

        return {success: true};
    } catch {
        return {error: t('unexpectedError')};
    }
}

export async function updateCustomerAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const t = await getTranslations('Errors');
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    if (!firstName || !lastName) {
        return {error: t('firstLastNameRequired')};
    }

    try {
        const result = await mutate(UpdateCustomerMutation, {
            input: {
                firstName,
                lastName,
            },
        }, {useAuthToken: true});

        const updateResult = result.data.updateCustomer;

        if (!updateResult || !updateResult.id) {
            return {error: t('failedUpdateCustomer')};
        }

        const locale = await getLocale();
        revalidatePath(`/${locale}/account/profile`);
        return {success: true};
    } catch {
        return {error: t('unexpectedError')};
    }
}

export async function requestEmailUpdateAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const t = await getTranslations('Errors');
    const password = formData.get('password') as string;
    const newEmailAddress = formData.get('newEmailAddress') as string;

    if (!password || !newEmailAddress) {
        return {error: t('passwordEmailRequired')};
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailAddress)) {
        return {error: t('invalidEmail')};
    }

    try {
        const result = await mutate(RequestUpdateCustomerEmailAddressMutation, {
            password,
            newEmailAddress,
        }, {useAuthToken: true});

        const updateResult = result.data.requestUpdateCustomerEmailAddress;

        if (updateResult.__typename !== 'Success') {
            return {error: updateResult.message};
        }

        return {success: true};
    } catch {
        return {error: t('unexpectedError')};
    }
}
