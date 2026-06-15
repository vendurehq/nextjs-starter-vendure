'use server';

import {addToCart as sharedAddToCart} from '@/lib/commerce/actions/cart';

export async function addToCart(variantId: string, quantity: number = 1) {
    return sharedAddToCart(variantId, quantity);
}
