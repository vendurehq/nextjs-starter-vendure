'use server';

import {mutate} from '@core/lib/vendure/api';
import {ResetPasswordMutation} from '@core/lib/vendure/mutations';
import {setAuthToken} from '@/lib/auth';
import {redirect} from 'next/navigation';

export async function resetPasswordAction(prevState: { error?: string } | undefined, formData: FormData) {
    const token = formData.get('token') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!token || !password || !confirmPassword) {
        return {error: 'All fields are required'};
    }

    if (password !== confirmPassword) {
        return {error: 'Passwords do not match'};
    }


    const result = await mutate(ResetPasswordMutation, {
        token,
        password,
    });

    const resetResult = result.data.resetPassword;

    if (resetResult.__typename !== 'CurrentUser') {
        return {error: resetResult.message};
    }

    // Store the token in a cookie if returned
    if (result.token) {
        await setAuthToken(result.token);
    }

    redirect('/');
}
