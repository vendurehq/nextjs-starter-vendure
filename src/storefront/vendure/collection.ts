import {graphql, readFragment, type FragmentOf} from '@/graphql';

export const StorefrontCollectionFragment = graphql(`
    fragment StorefrontCollection on Collection {
        id
    }
`);

export function readStorefrontCollection(
    collection: FragmentOf<typeof StorefrontCollectionFragment>
) {
    return readFragment(StorefrontCollectionFragment, collection);
}
