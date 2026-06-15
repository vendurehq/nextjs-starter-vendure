import {graphql, readFragment, type FragmentOf} from '@/graphql';

export const StorefrontOrderFragment = graphql(`
    fragment StorefrontOrder on Order {
        id
    }
`);

export function readStorefrontOrder(
    order: FragmentOf<typeof StorefrontOrderFragment>
) {
    return readFragment(StorefrontOrderFragment, order);
}
