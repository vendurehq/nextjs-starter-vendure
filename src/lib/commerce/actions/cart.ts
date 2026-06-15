'use server';

import {setAuthToken} from '@/lib/auth';
import {getActiveCurrencyCode} from '@/lib/currency-server';
import {mutate} from '@/lib/vendure/api';
import {
    AddToCartMutation,
    AdjustCartItemMutation,
    ApplyPromotionCodeMutation,
    RemoveFromCartMutation,
    RemovePromotionCodeMutation,
} from '@/lib/vendure/mutations';
import {updateTag} from 'next/cache';
import {getLocale, getTranslations} from 'next-intl/server';

export async function addToCart(variantId: string, quantity: number = 1) {
    const locale = await getLocale();
    const currencyCode = await getActiveCurrencyCode();
    const t = await getTranslations({locale, namespace: 'Errors'});

    try {
        const result = await mutate(
            AddToCartMutation,
            {variantId, quantity},
            {useAuthToken: true, currencyCode}
        );

        if (result.token) {
            await setAuthToken(result.token);
        }

        if (result.data.addItemToOrder.__typename === 'Order') {
            updateTag('cart');
            updateTag('active-order');
            return {success: true, order: result.data.addItemToOrder};
        }

        return {success: false, error: result.data.addItemToOrder.message};
    } catch {
        return {success: false, error: t('failedAddToCart')};
    }
}

export async function removeFromCart(lineId: string) {
    const currencyCode = await getActiveCurrencyCode();
    await mutate(RemoveFromCartMutation, {lineId}, {useAuthToken: true, currencyCode});
    updateTag('cart');
}

export async function adjustQuantity(lineId: string, quantity: number) {
    const currencyCode = await getActiveCurrencyCode();
    await mutate(AdjustCartItemMutation, {lineId, quantity}, {useAuthToken: true, currencyCode});
    updateTag('cart');
}

export async function applyPromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) {
        return;
    }

    const currencyCode = await getActiveCurrencyCode();
    await mutate(ApplyPromotionCodeMutation, {couponCode: code}, {useAuthToken: true, currencyCode});
    updateTag('cart');
}

export async function removePromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) {
        return;
    }

    const currencyCode = await getActiveCurrencyCode();
    await mutate(RemovePromotionCodeMutation, {couponCode: code}, {useAuthToken: true, currencyCode});
    updateTag('cart');
}
