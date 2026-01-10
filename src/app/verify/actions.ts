'use server';

import {mutate} from '@core/lib/vendure/api';
import {VerifyCustomerAccountMutation} from '@core/lib/vendure/mutations';
import {setAuthToken} from '@/lib/auth';

export async function verifyAccountAction(token: string, password?: string) {
    if (!token) {
        return {error: 'Verification token is required'};
    }

    try {
        const result = await mutate(VerifyCustomerAccountMutation, {
            token,
            password: password || undefined,
        });

        const verifyResult = result.data.verifyCustomerAccount;

        if (verifyResult.__typename !== 'CurrentUser') {
            return {error: verifyResult.message};
        }

        // Store the token in a cookie if returned
        if (result.token) {
            await setAuthToken(result.token);
        }

        return {success: true};
    } catch (error: unknown) {
        return {error: 'An unexpected error occurred. Please try again.'};
    }
}
