'use server';

import { mutate } from '@core/lib/vendure/api';
import { AddToCartMutation } from '@core/lib/vendure/mutations';
import { updateTag } from 'next/cache';
import { setAuthToken } from '@/lib/auth';

export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    const result = await mutate(AddToCartMutation, { variantId, quantity }, { useAuthToken: true });

    if (result.token) {
      await setAuthToken(result.token);
    }

    if (result.data.addItemToOrder.__typename === 'Order') {
      // Revalidate cart data across all pages
      updateTag('cart');
      updateTag('active-order');
      return { success: true, order: result.data.addItemToOrder };
    } else {
      return { success: false, error: result.data.addItemToOrder.message };
    }
  } catch {
    return { success: false, error: 'Failed to add item to cart' };
  }
}
