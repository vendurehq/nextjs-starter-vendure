'use server';

import {mutate} from '@core/lib/vendure/api';
import {
    CreateCustomerAddressMutation,
    UpdateCustomerAddressMutation,
    DeleteCustomerAddressMutation,
} from '@core/lib/vendure/mutations';
import {revalidatePath} from 'next/cache';

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

interface UpdateAddressInput extends AddressInput {
    id: string;
}

export async function createAddress(address: AddressInput) {
    const result = await mutate(
        CreateCustomerAddressMutation,
        {input: address},
        {useAuthToken: true}
    );

    if (!result.data.createCustomerAddress) {
        throw new Error('Failed to create address');
    }

    revalidatePath('/account/addresses');
    return result.data.createCustomerAddress;
}

export async function updateAddress(address: UpdateAddressInput) {
    const {id, ...input} = address;

    const result = await mutate(
        UpdateCustomerAddressMutation,
        {
            input: {
                id,
                fullName: input.fullName,
                streetLine1: input.streetLine1,
                streetLine2: input.streetLine2,
                city: input.city,
                province: input.province,
                postalCode: input.postalCode,
                countryCode: input.countryCode,
                phoneNumber: input.phoneNumber,
                company: input.company,
            },
        },
        {useAuthToken: true}
    );

    if (!result.data.updateCustomerAddress) {
        throw new Error('Failed to update address');
    }

    revalidatePath('/account/addresses');
    return result.data.updateCustomerAddress;
}

export async function deleteAddress(id: string) {
    const result = await mutate(
        DeleteCustomerAddressMutation,
        {id},
        {useAuthToken: true}
    );

    if (!result.data.deleteCustomerAddress.success) {
        throw new Error('Failed to delete address');
    }

    revalidatePath('/account/addresses');
    return result.data.deleteCustomerAddress;
}

export async function setDefaultShippingAddress(id: string) {
    const result = await mutate(
        UpdateCustomerAddressMutation,
        {
            input: {
                id,
                defaultShippingAddress: true,
            },
        },
        {useAuthToken: true}
    );

    if (!result.data.updateCustomerAddress) {
        throw new Error('Failed to set default shipping address');
    }

    revalidatePath('/account/addresses');
    return result.data.updateCustomerAddress;
}

export async function setDefaultBillingAddress(id: string) {
    const result = await mutate(
        UpdateCustomerAddressMutation,
        {
            input: {
                id,
                defaultBillingAddress: true,
            },
        },
        {useAuthToken: true}
    );

    if (!result.data.updateCustomerAddress) {
        throw new Error('Failed to set default billing address');
    }

    revalidatePath('/account/addresses');
    return result.data.updateCustomerAddress;
}
