'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Truck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCheckout } from '../checkout-provider';
import { setShippingMethod as setShippingMethodAction } from '../actions';

interface DeliveryStepProps {
  onComplete: () => void;
}

export default function DeliveryStep({ onComplete }: DeliveryStepProps) {
  const router = useRouter();
  const { shippingMethods, order } = useCheckout();
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(() => {
    // If order already has a shipping method selected, pre-select it
    if (order.shippingLines && order.shippingLines.length > 0) {
      return order.shippingLines[0].shippingMethod.id;
    }
    // Otherwise default to first method if there's only one
    return shippingMethods.length === 1 ? shippingMethods[0].id : null;
  });
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedMethodId) return;

    setSubmitting(true);
    try {
      await setShippingMethodAction(selectedMethodId);
      router.refresh();
      onComplete();
    } catch (error) {
      console.error('Error setting shipping method:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (shippingMethods.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No shipping methods available. Please check your address.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Select shipping method</h3>

      <RadioGroup value={selectedMethodId || ''} onValueChange={setSelectedMethodId}>
        {shippingMethods.map((method) => (
          <Label key={method.id} htmlFor={method.id} className="cursor-pointer">
            <Card className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{method.name}</p>
                    {method.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {method.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold">
                    {method.priceWithTax === 0
                      ? 'FREE'
                      : (method.priceWithTax / 100).toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                  </p>
                </div>
              </div>
            </Card>
          </Label>
        ))}
      </RadioGroup>

      <Button
        onClick={handleContinue}
        disabled={!selectedMethodId || submitting}
        className="w-full"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Continue to payment
      </Button>
    </div>
  );
}
