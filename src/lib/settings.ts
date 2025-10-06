import {cookies} from 'next/headers';

const CURRENCY_CODE_COOKIE = 'vendure-currency-code';

export async function setCurrencyCode(code: string) {
    const cookieStore = await cookies();
    cookieStore.set(CURRENCY_CODE_COOKIE, code, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
    });
}

export async function getCurrencyCode(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(CURRENCY_CODE_COOKIE)?.value;
}