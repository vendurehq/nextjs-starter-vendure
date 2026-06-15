'use server';

import type {AddressInput} from '@/lib/commerce/address';
import {
    createCustomerAddress as sharedCreateCustomerAddress,
    placeOrder as sharedPlaceOrder,
    setCustomerForOrder as sharedSetCustomerForOrder,
    setShippingAddress as sharedSetShippingAddress,
    setShippingMethod as sharedSetShippingMethod,
    transitionToArrangingPayment as sharedTransitionToArrangingPayment,
} from '@/lib/commerce/actions/checkout';

interface GuestCustomerInput {
    emailAddress: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}

export async function setShippingAddress(shippingAddress: AddressInput, useSameForBilling: boolean) {
    return sharedSetShippingAddress(shippingAddress, useSameForBilling);
}

export async function setShippingMethod(shippingMethodId: string) {
    return sharedSetShippingMethod(shippingMethodId);
}

export async function createCustomerAddress(address: AddressInput) {
    return sharedCreateCustomerAddress(address);
}

export async function transitionToArrangingPayment() {
    return sharedTransitionToArrangingPayment();
}

export async function placeOrder(paymentMethodCode: string) {
    return sharedPlaceOrder(paymentMethodCode);
}

export async function setCustomerForOrder(input: GuestCustomerInput) {
    return sharedSetCustomerForOrder(input);
}
