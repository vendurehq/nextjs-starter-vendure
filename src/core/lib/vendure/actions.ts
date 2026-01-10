import {query} from './api';
import {GetActiveCustomerQuery} from './queries';
import {getActiveChannelCached} from './cached';
import {cache} from "react";
import {readFragment} from "@/graphql";
import {ActiveCustomerFragment} from "./fragments";
import {getAuthToken} from "@/lib/auth";


export const getActiveCustomer = cache(async () => {
    const token = await getAuthToken();
    const result = await query(GetActiveCustomerQuery, undefined, {
        token
    });
    return readFragment(ActiveCustomerFragment, result.data.activeCustomer);
})

export const getActiveChannel = getActiveChannelCached;
