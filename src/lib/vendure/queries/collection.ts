import {graphql} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {StorefrontCollectionFragment} from '@/storefront/vendure/collection';

export const GetTopCollectionsQuery = graphql(`
    query GetTopCollections($parentId: String!) {
        collections(options: { filter: { parentId: { eq: $parentId } } }) {
            items {
                ...StorefrontCollection
                id
                name
                slug
            }
        }
    }
`, [StorefrontCollectionFragment]);

export const SearchProductsQuery = graphql(`
    query SearchProducts($input: SearchInput!) {
        search(input: $input) {
            totalItems
            items {
                ...ProductCard
            }
            facetValues {
                count
                facetValue {
                    id
                    name
                    facet {
                        id
                        name
                    }
                }
            }
        }
    }
`, [ProductCardFragment]);

export const GetCollectionProductsQuery = graphql(`
    query GetCollectionProducts($slug: String!, $input: SearchInput!) {
        collection(slug: $slug) {
            ...StorefrontCollection
            id
            name
            slug
            description
            featuredAsset {
                id
                preview
            }
        }
        search(input: $input) {
            totalItems
            items {
                ...ProductCard
            }
        }
    }
`, [ProductCardFragment, StorefrontCollectionFragment]);
