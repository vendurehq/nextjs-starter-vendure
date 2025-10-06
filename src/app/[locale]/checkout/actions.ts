'use server';

import { mutate } from '@/lib/vendure/api';
import {
  SetOrderShippingAddressMutation,
  SetOrderBillingAddressMutation,
  SetOrderShippingMethodMutation,
  AddPaymentToOrderMutation,
  CreateCustomerAddressMutation,
} from '@/lib/vendure/mutations';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface AddressInput {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  company?: string;
}

export async function setShippingAddress(
  shippingAddress: AddressInput,
  useSameForBilling: boolean
) {
  const shippingResult = await mutate(
    SetOrderShippingAddressMutation,
    { input: shippingAddress },
    { useAuthToken: true }
  );

  if (shippingResult.data.setOrderShippingAddress.__typename !== 'Order') {
    throw new Error('Failed to set shipping address');
  }

  if (useSameForBilling) {
    await mutate(
      SetOrderBillingAddressMutation,
      { input: shippingAddress },
      { useAuthToken: true }
    );
  }

  revalidatePath('/checkout');
}

export async function setShippingMethod(shippingMethodId: string) {
  const result = await mutate(
    SetOrderShippingMethodMutation,
    { shippingMethodId: [shippingMethodId] },
    { useAuthToken: true }
  );

  if (result.data.setOrderShippingMethod.__typename !== 'Order') {
    throw new Error('Failed to set shipping method');
  }

  revalidatePath('/checkout');
}

export async function createCustomerAddress(address: AddressInput) {
  const result = await mutate(
    CreateCustomerAddressMutation,
    { input: address },
    { useAuthToken: true }
  );

  if (!result.data.createCustomerAddress) {
    throw new Error('Failed to create customer address');
  }

  revalidatePath('/checkout');
  return result.data.createCustomerAddress;
}

export async function placeOrder() {
  const result = await mutate(
    AddPaymentToOrderMutation,
    {
      input: {
        method: 'standard-payment',
        metadata: {},
      },
    },
    { useAuthToken: true }
  );

  if (result.data.addPaymentToOrder.__typename !== 'Order') {
    const errorResult = result.data.addPaymentToOrder;
    throw new Error(
      `Failed to place order: ${errorResult.errorCode} - ${errorResult.message}`
    );
  }

  const orderCode = result.data.addPaymentToOrder.code;
  redirect(`/order-confirmation/${orderCode}`);
}
