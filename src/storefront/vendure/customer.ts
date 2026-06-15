import {graphql, readFragment, type FragmentOf} from '@/graphql';

export const StorefrontCustomerFragment = graphql(`
    fragment StorefrontCustomer on Customer {
        id
    }
`);

export function readStorefrontCustomer(
    customer: FragmentOf<typeof StorefrontCustomerFragment>
) {
    return readFragment(StorefrontCustomerFragment, customer);
}
