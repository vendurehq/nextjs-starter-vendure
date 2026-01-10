'use server';

import {mutate} from '@core/lib/vendure/api';
import {
    UpdateCustomerPasswordMutation,
    UpdateCustomerMutation,
    RequestUpdateCustomerEmailAddressMutation,
} from '@core/lib/vendure/mutations';
import {revalidatePath} from 'next/cache';

export async function updatePasswordAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return {error: 'All fields are required'};
    }

    if (newPassword !== confirmPassword) {
        return {error: 'New passwords do not match'};
    }

    if (currentPassword === newPassword) {
        return {error: 'New password must be different from current password'};
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
    } catch (error: unknown) {
        return {error: 'An unexpected error occurred. Please try again.'};
    }
}

export async function updateCustomerAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    if (!firstName || !lastName) {
        return {error: 'First name and last name are required'};
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
            return {error: 'Failed to update customer information'};
        }

        revalidatePath('/account/profile');
        return {success: true};
    } catch (error: unknown) {
        return {error: 'An unexpected error occurred. Please try again.'};
    }
}

export async function requestEmailUpdateAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const password = formData.get('password') as string;
    const newEmailAddress = formData.get('newEmailAddress') as string;

    if (!password || !newEmailAddress) {
        return {error: 'Password and new email address are required'};
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmailAddress)) {
        return {error: 'Please enter a valid email address'};
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
    } catch (error: unknown) {
        return {error: 'An unexpected error occurred. Please try again.'};
    }
}
