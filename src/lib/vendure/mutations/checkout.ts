import {graphql} from '@/graphql';
import {StorefrontOrderFragment} from '@/storefront/vendure/order';
import {StorefrontCustomerFragment} from '@/storefront/vendure/customer';

export const SetOrderShippingAddressMutation = graphql(`
    mutation SetOrderShippingAddress($input: CreateAddressInput!) {
        setOrderShippingAddress(input: $input) {
            __typename
            ... on Order {
                ...StorefrontOrder
                id
                code
                shippingAddress {
                    fullName
                    company
                    streetLine1
                    streetLine2
                    city
                    province
                    postalCode
                    country
                    phoneNumber
                }
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`, [StorefrontOrderFragment]);

export const SetOrderBillingAddressMutation = graphql(`
    mutation SetOrderBillingAddress($input: CreateAddressInput!) {
        setOrderBillingAddress(input: $input) {
            __typename
            ... on Order {
                ...StorefrontOrder
                id
                code
                billingAddress {
                    fullName
                    company
                    streetLine1
                    streetLine2
                    city
                    province
                    postalCode
                    country
                    phoneNumber
                }
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`, [StorefrontOrderFragment]);

export const SetOrderShippingMethodMutation = graphql(`
    mutation SetOrderShippingMethod($shippingMethodId: [ID!]!) {
        setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
            __typename
            ... on Order {
                ...StorefrontOrder
                id
                code
                shippingWithTax
                totalWithTax
                shippingLines {
                    shippingMethod {
                        id
                        name
                        description
                    }
                    priceWithTax
                }
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`, [StorefrontOrderFragment]);

export const TransitionOrderToStateMutation = graphql(`
    mutation TransitionOrderToState($state: String!) {
        transitionOrderToState(state: $state) {
            __typename
            ... on Order {
                ...StorefrontOrder
                id
                code
                state
            }
            ... on OrderStateTransitionError {
                errorCode
                message
                transitionError
                fromState
                toState
            }
        }
    }
`, [StorefrontOrderFragment]);

export const AddPaymentToOrderMutation = graphql(`
    mutation AddPaymentToOrder($input: PaymentInput!) {
        addPaymentToOrder(input: $input) {
            __typename
            ... on Order {
                ...StorefrontOrder
                id
                code
                state
                payments {
                    id
                    method
                    amount
                    state
                }
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`, [StorefrontOrderFragment]);

export const SetCustomerForOrderMutation = graphql(`
    mutation SetCustomerForOrder($input: CreateCustomerInput!) {
        setCustomerForOrder(input: $input) {
            __typename
            ... on Order {
                ...StorefrontOrder
                id
                code
                customer {
                    ...StorefrontCustomer
                    id
                    firstName
                    lastName
                    emailAddress
                    phoneNumber
                }
            }
            ... on AlreadyLoggedInError {
                errorCode
                message
            }
            ... on EmailAddressConflictError {
                errorCode
                message
            }
            ... on GuestCheckoutError {
                errorCode
                message
            }
            ... on NoActiveOrderError {
                errorCode
                message
            }
        }
    }
`, [StorefrontCustomerFragment, StorefrontOrderFragment]);
