import { ResultOf } from '@/platform/vendure/graphql';
import {GetActiveOrderForCheckoutQuery} from '@/features/checkout/graphql';

export type CheckoutOrder = NonNullable<ResultOf<typeof GetActiveOrderForCheckoutQuery>['activeOrder']>;
export type OrderLine = CheckoutOrder['lines'][number];
export type ShippingAddress = CheckoutOrder['shippingAddress'];
export type BillingAddress = CheckoutOrder['billingAddress'];
