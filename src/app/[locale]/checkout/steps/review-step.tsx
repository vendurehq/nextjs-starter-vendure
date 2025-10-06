'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, MapPin, Truck, CreditCard, Edit } from 'lucide-react';
import Image from 'next/image';
import { OrderLine } from '../types';
import { useCheckout } from '../checkout-provider';
import { placeOrder as placeOrderAction } from '../actions';

interface ReviewStepProps {
  onEditStep: (step: 'shipping' | 'delivery' | 'payment') => void;
}

export default function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { order } = useCheckout();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      await placeOrderAction();
    } catch (error) {
      console.error('Error placing order:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Review your order</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Shipping Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Shipping Address</h4>
          </div>
          {order.shippingAddress ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.streetLine1}
                  {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                <p className="text-muted-foreground">{order.shippingAddress.phoneNumber}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStep('shipping')}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shipping address set</p>
          )}
        </div>

        {/* Delivery Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Delivery Method</h4>
          </div>
          {order.shippingLines && order.shippingLines.length > 0 ? (
            <div className="text-sm space-y-3">
              <div>
                <p className="font-medium">{order.shippingLines[0].shippingMethod.name}</p>
                <p className="text-muted-foreground">
                  {order.shippingLines[0].priceWithTax === 0
                    ? 'FREE'
                    : (order.shippingLines[0].priceWithTax / 100).toLocaleString('en-US', {
                        style: 'currency',
                        currency: order.currencyCode,
                      })}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStep('delivery')}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No delivery method selected</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Payment Method</h4>
          </div>
          <div className="text-sm space-y-3">
            <p className="text-muted-foreground">Payment will be processed at order completion</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditStep('payment')}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <Button
        onClick={handlePlaceOrder}
        disabled={loading || !order.shippingAddress || !order.shippingLines?.length}
        size="lg"
        className="w-full"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Place Order
      </Button>

      {(!order.shippingAddress || !order.shippingLines?.length) && (
        <p className="text-sm text-destructive text-center">
          Please complete all previous steps before placing your order
        </p>
      )}
    </div>
  );
}
