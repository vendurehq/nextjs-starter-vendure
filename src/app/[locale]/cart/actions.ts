'use server';

import {
    adjustQuantity as sharedAdjustQuantity,
    applyPromotionCode as sharedApplyPromotionCode,
    removeFromCart as sharedRemoveFromCart,
    removePromotionCode as sharedRemovePromotionCode,
} from '@/lib/commerce/actions/cart';

export async function removeFromCart(lineId: string) {
    return sharedRemoveFromCart(lineId);
}

export async function adjustQuantity(lineId: string, quantity: number) {
    return sharedAdjustQuantity(lineId, quantity);
}

export async function applyPromotionCode(formData: FormData) {
    return sharedApplyPromotionCode(formData);
}

export async function removePromotionCode(formData: FormData) {
    return sharedRemovePromotionCode(formData);
}
