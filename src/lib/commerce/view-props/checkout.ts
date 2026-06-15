import type {ResultOf} from '@/graphql';
import {
    GetActiveOrderForCheckoutQuery,
    GetCustomerAddressesQuery,
    GetEligiblePaymentMethodsQuery,
    GetEligibleShippingMethodsQuery,
    GetAvailableCountriesQuery,
} from '@/lib/vendure/queries';

export type CheckoutViewOrder = NonNullable<ResultOf<typeof GetActiveOrderForCheckoutQuery>['activeOrder']>;
export type CheckoutViewAddresses = NonNullable<
    NonNullable<ResultOf<typeof GetCustomerAddressesQuery>['activeCustomer']>['addresses']
>;
export type CheckoutViewCountries = NonNullable<ResultOf<typeof GetAvailableCountriesQuery>['availableCountries']>;
export type CheckoutViewShippingMethods = NonNullable<ResultOf<typeof GetEligibleShippingMethodsQuery>['eligibleShippingMethods']>;
export type CheckoutViewPaymentMethods = NonNullable<ResultOf<typeof GetEligiblePaymentMethodsQuery>['eligiblePaymentMethods']>;

export interface CheckoutViewProps {
    title: string;
    order: CheckoutViewOrder;
    addresses: CheckoutViewAddresses;
    countries: CheckoutViewCountries;
    shippingMethods: CheckoutViewShippingMethods;
    paymentMethods: CheckoutViewPaymentMethods;
    isGuest: boolean;
}
