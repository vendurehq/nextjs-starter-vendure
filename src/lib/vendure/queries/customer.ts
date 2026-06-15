import {graphql} from '@/graphql';
import {ActiveCustomerFragment} from '@/lib/vendure/fragments';
import {StorefrontAddressFragment} from '@/storefront/vendure/address';

export const GetActiveCustomerQuery = graphql(`
    query GetActiveCustomer {
        activeCustomer {
            ...ActiveCustomer
        }
    }
`, [ActiveCustomerFragment]);

export const GetCustomerAddressesQuery = graphql(`
    query GetCustomerAddresses {
        activeCustomer {
            id
            addresses {
                ...StorefrontAddress
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
    }
`, [StorefrontAddressFragment]);
