import {graphql, readFragment, type FragmentOf} from '@/graphql';

export const StorefrontAddressFragment = graphql(`
    fragment StorefrontAddress on Address {
        id
    }
`);

export function readStorefrontAddress(
    address: FragmentOf<typeof StorefrontAddressFragment>
) {
    return readFragment(StorefrontAddressFragment, address);
}
