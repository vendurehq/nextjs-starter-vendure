import {graphql} from '@/graphql';
import {StorefrontCustomerFragment} from '@/storefront/vendure/customer';

export const ActiveCustomerFragment = graphql(`
    fragment ActiveCustomer on Customer {
        ...StorefrontCustomer
        id
        firstName
        lastName
        emailAddress
    }
`, [StorefrontCustomerFragment]);
