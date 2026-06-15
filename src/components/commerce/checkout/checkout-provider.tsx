'use client';

import { createContext, useContext, ReactNode, useState } from 'react';
import type { CheckoutOrder } from './types';
import type {
  CheckoutViewAddresses,
  CheckoutViewCountries,
  CheckoutViewPaymentMethods,
  CheckoutViewShippingMethods,
} from '@/lib/commerce/view-props/checkout';

interface CheckoutContextType {
  order: CheckoutOrder;
  addresses: CheckoutViewAddresses;
  countries: CheckoutViewCountries;
  shippingMethods: CheckoutViewShippingMethods;
  paymentMethods: CheckoutViewPaymentMethods;
  selectedPaymentMethodCode: string | null;
  setSelectedPaymentMethodCode: (code: string | null) => void;
  isGuest: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

interface CheckoutProviderProps {
  children: ReactNode;
  order: CheckoutOrder;
  addresses: CheckoutViewAddresses;
  countries: CheckoutViewCountries;
  shippingMethods: CheckoutViewShippingMethods;
  paymentMethods: CheckoutViewPaymentMethods;
  isGuest: boolean;
}

export function CheckoutProvider({
  children,
  order,
  addresses,
  countries,
  shippingMethods,
  paymentMethods,
  isGuest,
}: CheckoutProviderProps) {
  const [selectedPaymentMethodCode, setSelectedPaymentMethodCode] = useState<string | null>(
    paymentMethods.length === 1 ? paymentMethods[0].code : null
  );

  return (
    <CheckoutContext.Provider
      value={{
        order,
        addresses,
        countries,
        shippingMethods,
        paymentMethods,
        selectedPaymentMethodCode,
        setSelectedPaymentMethodCode,
        isGuest,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}
