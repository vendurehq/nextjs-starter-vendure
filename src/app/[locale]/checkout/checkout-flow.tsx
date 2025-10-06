'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ShippingAddressStep from './steps/shipping-address-step';
import DeliveryStep from './steps/delivery-step';
import PaymentStep from './steps/payment-step';
import ReviewStep from './steps/review-step';
import OrderSummary from './order-summary';
import { useCheckout } from './checkout-provider';

type CheckoutStep = 'shipping' | 'delivery' | 'payment' | 'review';

export default function CheckoutFlow() {
  const { order } = useCheckout();

  // Determine initial step and completed steps based on order state
  const getInitialState = () => {
    const completed = new Set<CheckoutStep>();
    let current: CheckoutStep = 'shipping';

    if (order.shippingAddress) {
      completed.add('shipping');
      current = 'delivery';
    }

    if (order.shippingLines && order.shippingLines.length > 0) {
      completed.add('delivery');
      current = 'payment';
    }

    return { completed, current };
  };

  const initialState = getInitialState();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(initialState.current);
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(initialState.completed);

  const handleStepComplete = (step: CheckoutStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));

    const stepOrder: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review'];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const canAccessStep = (step: CheckoutStep): boolean => {
    const stepOrder: CheckoutStep[] = ['shipping', 'delivery', 'payment', 'review'];
    const stepIndex = stepOrder.indexOf(step);

    if (stepIndex === 0) return true;

    const previousStep = stepOrder[stepIndex - 1];
    return completedSteps.has(previousStep);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Accordion
          type="single"
          collapsible
          value={currentStep}
          onValueChange={(value) => {
            if (value && canAccessStep(value as CheckoutStep)) {
              setCurrentStep(value as CheckoutStep);
            }
          }}
          className="space-y-4"
        >
          <AccordionItem value="shipping" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  completedSteps.has('shipping')
                    ? 'bg-green-500 text-white'
                    : currentStep === 'shipping'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.has('shipping') ? '✓' : '1'}
                </div>
                <span className="text-lg font-semibold">Shipping Address</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ShippingAddressStep
                onComplete={() => handleStepComplete('shipping')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="delivery"
            className="border rounded-lg px-6"
            disabled={!canAccessStep('delivery')}
          >
            <AccordionTrigger
              className="hover:no-underline"
              disabled={!canAccessStep('delivery')}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  completedSteps.has('delivery')
                    ? 'bg-green-500 text-white'
                    : currentStep === 'delivery'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.has('delivery') ? '✓' : '2'}
                </div>
                <span className="text-lg font-semibold">Delivery Method</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <DeliveryStep
                onComplete={() => handleStepComplete('delivery')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="payment"
            className="border rounded-lg px-6"
            disabled={!canAccessStep('payment')}
          >
            <AccordionTrigger
              className="hover:no-underline"
              disabled={!canAccessStep('payment')}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  completedSteps.has('payment')
                    ? 'bg-green-500 text-white'
                    : currentStep === 'payment'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {completedSteps.has('payment') ? '✓' : '3'}
                </div>
                <span className="text-lg font-semibold">Payment Method</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <PaymentStep
                onComplete={() => handleStepComplete('payment')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="review"
            className="border rounded-lg px-6"
            disabled={!canAccessStep('review')}
          >
            <AccordionTrigger
              className="hover:no-underline"
              disabled={!canAccessStep('review')}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  currentStep === 'review'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  4
                </div>
                <span className="text-lg font-semibold">Review & Place Order</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <ReviewStep
                onEditStep={setCurrentStep}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="lg:col-span-1">
        <OrderSummary />
      </div>
    </div>
  );
}
