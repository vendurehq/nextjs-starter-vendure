import {graphql, readFragment, type FragmentOf} from '@/graphql';

export const StorefrontProductFragment = graphql(`
    fragment StorefrontProduct on Product {
        id
    }
`);

export function readStorefrontProduct(
    product: FragmentOf<typeof StorefrontProductFragment>
) {
    return readFragment(StorefrontProductFragment, product);
}
