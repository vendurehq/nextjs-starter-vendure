'use server';

import { mutate } from '@/lib/vendure/api';
import { AddToCartMutation } from '@/lib/vendure/mutations';
import { revalidateTag } from 'next/cache';
import { setAuthToken, getAuthToken } from '@/lib/auth';

export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    const result = await mutate(AddToCartMutation, { variantId, quantity }, { useAuthToken: true });

    // Only store the auth token if we don't have one yet (new session)
    const existingToken = await getAuthToken();
    if (result.token && !existingToken) {
      await setAuthToken(result.token);
    }

    if (result.data.addItemToOrder.__typename === 'Order') {
      // Revalidate cart data across all pages
      revalidateTag('cart');
      return { success: true, order: result.data.addItemToOrder };
    } else {
      return { success: false, error: result.data.addItemToOrder.message };
    }
  } catch (error) {
    return { success: false, error: 'Failed to add item to cart' };
  }
}
