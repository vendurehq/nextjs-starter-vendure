import { graphql } from '@/graphql';

export const LoginMutation = graphql(`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            __typename
            ... on CurrentUser {
                id
                identifier
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const AddToCartMutation = graphql(`
    mutation AddToCart($variantId: ID!, $quantity: Int!) {
        addItemToOrder(productVariantId: $variantId, quantity: $quantity) {
            __typename
            ... on Order {
                id
                code
                totalQuantity
                lines {
                    id
                    productVariant {
                        id
                        name
                    }
                    quantity
                }
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const RemoveFromCartMutation = graphql(`
    mutation RemoveFromCart($lineId: ID!) {
        removeOrderLine(orderLineId: $lineId) {
            __typename
            ... on Order {
                id
                code
                totalQuantity
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const AdjustCartItemMutation = graphql(`
    mutation AdjustCartItem($lineId: ID!, $quantity: Int!) {
        adjustOrderLine(orderLineId: $lineId, quantity: $quantity) {
            __typename
            ... on Order {
                id
                code
                totalQuantity
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const ApplyPromotionCodeMutation = graphql(`
    mutation ApplyPromotionCode($couponCode: String!) {
        applyCouponCode(couponCode: $couponCode) {
            __typename
            ... on Order {
                id
                code
                totalWithTax
                couponCodes
                discounts {
                    description
                    amountWithTax
                }
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const RemovePromotionCodeMutation = graphql(`
    mutation RemovePromotionCode($couponCode: String!) {
        removeCouponCode(couponCode: $couponCode) {
            id
            code
            totalWithTax
            couponCodes
            discounts {
                description
                amountWithTax
            }
        }
    }
`);

export const CreateCustomerAddressMutation = graphql(`
    mutation CreateCustomerAddress($input: CreateAddressInput!) {
        createCustomerAddress(input: $input) {
            id
            fullName
            company
            streetLine1
            streetLine2
            city
            province
            postalCode
            country {
                id
                code
                name
            }
            phoneNumber
            defaultShippingAddress
            defaultBillingAddress
        }
    }
`);

export const UpdateCustomerAddressMutation = graphql(`
    mutation UpdateCustomerAddress($input: UpdateAddressInput!) {
        updateCustomerAddress(input: $input) {
            id
            fullName
            company
            streetLine1
            streetLine2
            city
            province
            postalCode
            country {
                id
                code
                name
            }
            phoneNumber
            defaultShippingAddress
            defaultBillingAddress
        }
    }
`);

export const DeleteCustomerAddressMutation = graphql(`
    mutation DeleteCustomerAddress($id: ID!) {
        deleteCustomerAddress(id: $id) {
            success
        }
    }
`);

export const SetOrderShippingAddressMutation = graphql(`
    mutation SetOrderShippingAddress($input: CreateAddressInput!) {
        setOrderShippingAddress(input: $input) {
            __typename
            ... on Order {
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
`);

export const SetOrderBillingAddressMutation = graphql(`
    mutation SetOrderBillingAddress($input: CreateAddressInput!) {
        setOrderBillingAddress(input: $input) {
            __typename
            ... on Order {
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
`);

export const SetOrderShippingMethodMutation = graphql(`
    mutation SetOrderShippingMethod($shippingMethodId: [ID!]!) {
        setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
            __typename
            ... on Order {
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
`);

export const TransitionOrderToStateMutation = graphql(`
    mutation TransitionOrderToState($state: String!) {
        transitionOrderToState(state: $state) {
            __typename
            ... on Order {
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
`);

export const AddPaymentToOrderMutation = graphql(`
    mutation AddPaymentToOrder($input: PaymentInput!) {
        addPaymentToOrder(input: $input) {
            __typename
            ... on Order {
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
`);

export const RegisterCustomerAccountMutation = graphql(`
    mutation RegisterCustomerAccount($input: RegisterCustomerInput!) {
        registerCustomerAccount(input: $input) {
            __typename
            ... on Success {
                success
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const VerifyCustomerAccountMutation = graphql(`
    mutation VerifyCustomerAccount($token: String!, $password: String) {
        verifyCustomerAccount(token: $token, password: $password) {
            __typename
            ... on CurrentUser {
                id
                identifier
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const RequestPasswordResetMutation = graphql(`
    mutation RequestPasswordReset($emailAddress: String!) {
        requestPasswordReset(emailAddress: $emailAddress) {
            __typename
            ... on Success {
                success
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const ResetPasswordMutation = graphql(`
    mutation ResetPassword($token: String!, $password: String!) {
        resetPassword(token: $token, password: $password) {
            __typename
            ... on CurrentUser {
                id
                identifier
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const UpdateCustomerPasswordMutation = graphql(`
    mutation UpdateCustomerPassword($currentPassword: String!, $newPassword: String!) {
        updateCustomerPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
            __typename
            ... on Success {
                success
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const LogoutMutation = graphql(`
    mutation Logout {
        logout {
            __typename
            ... on Success {
                success
            }
        }
    }
`);

export const UpdateCustomerMutation = graphql(`
    mutation UpdateCustomer($input: UpdateCustomerInput!) {
        updateCustomer(input: $input) {
            __typename
            id
            firstName
            lastName
            emailAddress
        }
    }
`);

export const RequestUpdateCustomerEmailAddressMutation = graphql(`
    mutation RequestUpdateCustomerEmailAddress($password: String!, $newEmailAddress: String!) {
        requestUpdateCustomerEmailAddress(password: $password, newEmailAddress: $newEmailAddress) {
            __typename
            ... on Success {
                success
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);

export const UpdateCustomerEmailAddressMutation = graphql(`
    mutation UpdateCustomerEmailAddress($token: String!) {
        updateCustomerEmailAddress(token: $token) {
            __typename
            ... on Success {
                success
            }
            ... on ErrorResult {
                errorCode
                message
            }
        }
    }
`);
