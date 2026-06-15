import type {ResultOf, VariablesOf} from '@/graphql';
import {GetAvailableCountriesQuery, GetCustomerAddressesQuery} from '@/lib/vendure/queries';
import {CreateCustomerAddressMutation} from '@/lib/vendure/mutations';

export type AddressInput = VariablesOf<typeof CreateCustomerAddressMutation>['input'];
export type UpdateAddressInput = AddressInput & {id: string};

export type Country = NonNullable<
    ResultOf<typeof GetAvailableCountriesQuery>['availableCountries']
>[number];

export type CustomerAddress = NonNullable<
    NonNullable<ResultOf<typeof GetCustomerAddressesQuery>['activeCustomer']>['addresses']
>[number];

export function addressToInput(address: CustomerAddress): AddressInput {
    return {
        fullName: address.fullName || '',
        company: address.company || '',
        streetLine1: address.streetLine1,
        streetLine2: address.streetLine2 || '',
        city: address.city || '',
        province: address.province || '',
        postalCode: address.postalCode || '',
        countryCode: address.country.code,
        phoneNumber: address.phoneNumber || '',
    };
}
