'use server';

import type {AddressInput, UpdateAddressInput} from '@/lib/commerce/address';
import {
    createAddress as sharedCreateAddress,
    deleteAddress as sharedDeleteAddress,
    setDefaultBillingAddress as sharedSetDefaultBillingAddress,
    setDefaultShippingAddress as sharedSetDefaultShippingAddress,
    updateAddress as sharedUpdateAddress,
} from '@/lib/commerce/actions/account';

export async function createAddress(address: AddressInput) {
    return sharedCreateAddress(address);
}

export async function updateAddress(address: UpdateAddressInput) {
    return sharedUpdateAddress(address);
}

export async function deleteAddress(id: string) {
    return sharedDeleteAddress(id);
}

export async function setDefaultShippingAddress(id: string) {
    return sharedSetDefaultShippingAddress(id);
}

export async function setDefaultBillingAddress(id: string) {
    return sharedSetDefaultBillingAddress(id);
}
