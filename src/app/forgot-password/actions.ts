'use server';

import {mutate} from '@core/lib/vendure/api';
import {RequestPasswordResetMutation} from '@core/lib/vendure/mutations';

export async function requestPasswordResetAction(prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
    const emailAddress = formData.get('emailAddress') as string;

    if (!emailAddress) {
        return {error: 'Email address is required'};
    }

    try {
        const result = await mutate(RequestPasswordResetMutation, {
            emailAddress,
        });

        const resetResult = result.data.requestPasswordReset;

        if (resetResult?.__typename !== 'Success') {
            return {error: resetResult?.message || 'Failed to request password reset'};
        }

        return {success: true};
    } catch (error: unknown) {
        return {error: 'An unexpected error occurred. Please try again.'};
    }
}
