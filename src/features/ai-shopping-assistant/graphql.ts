import {graphql} from '@/platform/vendure/graphql';

export const GetCandidateProductsQuery = graphql(`
    query GetCandidateProducts($ids: [String!]!, $take: Int!) {
        products(options: { filter: { id: { in: $ids } }, take: $take }) {
            items {
                id
                description
                facetValues {
                    code
                    name
                    facet {
                        code
                        name
                    }
                }
                variants {
                    id
                    name
                    sku
                    priceWithTax
                    currencyCode
                    options {
                        code
                        name
                        group {
                            code
                            name
                        }
                    }
                }
            }
        }
    }
`);
