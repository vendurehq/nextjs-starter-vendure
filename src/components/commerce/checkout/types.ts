import { ResultOf } from '@/graphql';
import { GetActiveOrderForCheckoutQuery } from '@/lib/vendure/queries';

export type CheckoutOrder = NonNullable<ResultOf<typeof GetActiveOrderForCheckoutQuery>['activeOrder']>;
export type OrderLine = CheckoutOrder['lines'][number];
export type ShippingAddress = CheckoutOrder['shippingAddress'];
export type BillingAddress = CheckoutOrder['billingAddress'];
