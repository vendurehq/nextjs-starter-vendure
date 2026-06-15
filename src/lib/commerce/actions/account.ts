'use server';

import type {AddressInput, UpdateAddressInput} from '@/lib/commerce/address';
import {mutate} from '@/lib/vendure/api';
import {
    CreateCustomerAddressMutation,
    DeleteCustomerAddressMutation,
    RequestUpdateCustomerEmailAddressMutation,
    UpdateCustomerAddressMutation,
    UpdateCustomerMutation,
    UpdateCustomerPasswordMutation,
} from '@/lib/vendure/mutations';
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

export async function createAddress(address: AddressInput) {
    const result = await mutate(
        CreateCustomerAddressMutation,
        {input: address},
        {useAuthToken: true}
    );

    if (!result.data.createCustomerAddress) {
        throw new Error('Failed to create address');
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/account/addresses`);
    return result.data.createCustomerAddress;
}

export async function updateAddress(address: UpdateAddressInput) {
    const {id, ...input} = address;

    const result = await mutate(
        UpdateCustomerAddressMutation,
        {
            input: {
                id,
                fullName: input.fullName,
                streetLine1: input.streetLine1,
                streetLine2: input.streetLine2,
                city: input.city,
                province: input.province,
                postalCode: input.postalCode,
                countryCode: input.countryCode,
                phoneNumber: input.phoneNumber,
                company: input.company,
                customFields: input.customFields,
            },
        },
        {useAuthToken: true}
    );

    if (!result.data.updateCustomerAddress) {
        throw new Error('Failed to update address');
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/account/addresses`);
    return result.data.updateCustomerAddress;
}

export async function deleteAddress(id: string) {
    const result = await mutate(
        DeleteCustomerAddressMutation,
        {id},
        {useAuthToken: true}
    );

    if (!result.data.deleteCustomerAddress.success) {
        throw new Error('Failed to delete address');
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/account/addresses`);
    return result.data.deleteCustomerAddress;
}

export async function setDefaultShippingAddress(id: string) {
    const result = await mutate(
        UpdateCustomerAddressMutation,
        {
            input: {
                id,
                defaultShippingAddress: true,
            },
        },
        {useAuthToken: true}
    );

    if (!result.data.updateCustomerAddress) {
        throw new Error('Failed to set default shipping address');
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/account/addresses`);
    return result.data.updateCustomerAddress;
}

export async function setDefaultBillingAddress(id: string) {
    const result = await mutate(
        UpdateCustomerAddressMutation,
        {
            input: {
                id,
                defaultBillingAddress: true,
            },
        },
        {useAuthToken: true}
    );

    if (!result.data.updateCustomerAddress) {
        throw new Error('Failed to set default billing address');
    }

    const locale = await getLocale();
    revalidatePath(`/${locale}/account/addresses`);
    return result.data.updateCustomerAddress;
}
