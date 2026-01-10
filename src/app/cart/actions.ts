'use server';

import {mutate} from '@core/lib/vendure/api';
import {
    RemoveFromCartMutation,
    AdjustCartItemMutation,
    ApplyPromotionCodeMutation,
    RemovePromotionCodeMutation
} from '@core/lib/vendure/mutations';
import {updateTag} from 'next/cache';

export async function removeFromCart(lineId: string) {
    await mutate(RemoveFromCartMutation, {lineId}, {useAuthToken: true});
    updateTag('cart');
}

export async function adjustQuantity(lineId: string, quantity: number) {
    await mutate(AdjustCartItemMutation, {lineId, quantity}, {useAuthToken: true});
    updateTag('cart');
}

export async function applyPromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) return;

    const res = await mutate(ApplyPromotionCodeMutation, {couponCode: code}, {useAuthToken: true});
    console.log({res: res.data.applyCouponCode})
    updateTag('cart');
}

export async function removePromotionCode(formData: FormData) {
    const code = formData.get('code') as string;
    if (!code) return;

    const res = await mutate(RemovePromotionCodeMutation, {couponCode: code}, {useAuthToken: true});
    console.log({removeRes: res.data.removeCouponCode});
    updateTag('cart');
}
