import type {Metadata} from 'next';
import {query} from '@core/lib/vendure/api';
import {
    GetActiveOrderForCheckoutQuery,
    GetCustomerAddressesQuery,
    GetEligiblePaymentMethodsQuery,
    GetEligibleShippingMethodsQuery,
} from '@core/lib/vendure/queries';
import {redirect} from 'next/navigation';
import CheckoutFlow from './checkout-flow';
import {CheckoutProvider} from './checkout-provider';
import {noIndexRobots} from '@/lib/metadata';
import {getActiveCustomer} from '@core/lib/vendure/actions';
import {getAvailableCountriesCached} from '@core/lib/vendure/cached';

export const metadata: Metadata = {
    title: 'Checkout',
    description: 'Complete your purchase.',
    robots: noIndexRobots(),
};

export default async function CheckoutPage(_props: PageProps<'/checkout'>) {
    // Check if user is authenticated
    const customer = await getActiveCustomer();
    if (!customer) {
        redirect('/sign-in?redirectTo=/checkout');
    }

    const [orderRes, addressesRes, countries, shippingMethodsRes, paymentMethodsRes] =
        await Promise.all([
            query(GetActiveOrderForCheckoutQuery, {}, {useAuthToken: true}),
            query(GetCustomerAddressesQuery, {}, {useAuthToken: true}),
            getAvailableCountriesCached(),
            query(GetEligibleShippingMethodsQuery, {}, {useAuthToken: true}),
            query(GetEligiblePaymentMethodsQuery, {}, {useAuthToken: true}),
        ]);

    const activeOrder = orderRes.data.activeOrder;

    if (!activeOrder || activeOrder.lines.length === 0) {
        return redirect('/cart');
    }

    // If the order is no longer in AddingItems state, it's been completed
    // Redirect to the order confirmation page
    if (activeOrder.state !== 'AddingItems' && activeOrder.state !== 'ArrangingPayment') {
        return redirect(`/order-confirmation/${activeOrder.code}`);
    }

    const addresses = addressesRes.data.activeCustomer?.addresses || [];
    const shippingMethods = shippingMethodsRes.data.eligibleShippingMethods || [];
    const paymentMethods =
        paymentMethodsRes.data.eligiblePaymentMethods?.filter((m) => m.isEligible) || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            <CheckoutProvider
                order={activeOrder}
                addresses={addresses}
                countries={countries}
                shippingMethods={shippingMethods}
                paymentMethods={paymentMethods}
            >
                <CheckoutFlow/>
            </CheckoutProvider>
        </div>
    );
}
