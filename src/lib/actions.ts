'use server';

import {revalidatePath, revalidateTag} from 'next/cache';
import {setCurrencyCode} from './settings';

export async function updateCurrencyCode(code: string) {
    await setCurrencyCode(code);
    revalidateTag('cart');
    revalidatePath('/', 'layout');
}
