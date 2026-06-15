import CheckoutFlow from '@/components/commerce/checkout/checkout-flow';
import {CheckoutProvider} from '@/components/commerce/checkout/checkout-provider';
import type {CheckoutViewProps} from '@/lib/commerce/view-props/checkout';

export function CheckoutView({
    title,
    order,
    addresses,
    countries,
    shippingMethods,
    paymentMethods,
    isGuest,
}: CheckoutViewProps) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{title}</h1>
            <CheckoutProvider
                order={order}
                addresses={addresses}
                countries={countries}
                shippingMethods={shippingMethods}
                paymentMethods={paymentMethods}
                isGuest={isGuest}
            >
                <CheckoutFlow />
            </CheckoutProvider>
        </div>
    );
}
