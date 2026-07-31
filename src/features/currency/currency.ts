import {cookies} from 'next/headers';

const CURRENCY_COOKIE = 'vendure-currency';

export async function setCurrencyCookie(currencyCode: string) {
    const cookieStore = await cookies();
    cookieStore.set(CURRENCY_COOKIE, currencyCode, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
    });
}

export async function getCurrencyCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get(CURRENCY_COOKIE)?.value;
}
