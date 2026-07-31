import { initGraphQLTada } from 'gql.tada';
import type {introspection} from '../../graphql-env.d.ts';

export const graphql = initGraphQLTada<{
    introspection: introspection;
    scalars: {
        DateTime: string,
        JSON: Record<string, unknown>,
        Money: number
    }
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';
