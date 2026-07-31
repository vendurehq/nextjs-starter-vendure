import {cache} from 'react';
import {readFragment} from '@/platform/vendure/graphql';
import {getAuthToken} from '@/platform/vendure/auth-token';
import {query} from '@/platform/vendure/api';
import {ActiveCustomerFragment, GetActiveCustomerQuery} from './graphql';

export const getActiveCustomer = cache(async () => {
    const token = await getAuthToken();
    const result = await query(GetActiveCustomerQuery, undefined, {token});
    return readFragment(ActiveCustomerFragment, result.data.activeCustomer);
});
