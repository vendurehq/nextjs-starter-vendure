import { query } from '@/lib/vendure/api';
import {
  GetActiveOrderForCheckoutQuery,
  GetCustomerAddressesQuery,
  GetAvailableCountriesQuery,
  GetEligibleShippingMethodsQuery,
  GetEligiblePaymentMethodsQuery,
} from '@/lib/vendure/queries';
import { redirect } from 'next/navigation';
import CheckoutFlow from './checkout-flow';
import { CheckoutProvider } from './checkout-provider';

export default async function CheckoutPage() {
  const [orderRes, addressesRes, countriesRes, shippingMethodsRes, paymentMethodsRes] =
    await Promise.all([
      query(GetActiveOrderForCheckoutQuery, {}, { useAuthToken: true }),
      query(GetCustomerAddressesQuery, {}, { useAuthToken: true }),
      query(GetAvailableCountriesQuery, {}, { useAuthToken: true }),
      query(GetEligibleShippingMethodsQuery, {}, { useAuthToken: true }),
      query(GetEligiblePaymentMethodsQuery, {}, { useAuthToken: true }),
    ]);

  const activeOrder = orderRes.data.activeOrder;

  if (!activeOrder || activeOrder.lines.length === 0) {
    redirect('/cart');
  }

  const addresses = addressesRes.data.activeCustomer?.addresses || [];
  const countries = countriesRes.data.availableCountries || [];
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
        <CheckoutFlow />
      </CheckoutProvider>
    </div>
  );
}
