import { query, mutate } from '@/lib/vendure/api';
import { GetActiveOrderQuery } from '@/lib/vendure/queries';
import { RemoveFromCartMutation, AdjustCartItemMutation, ApplyPromotionCodeMutation, RemovePromotionCodeMutation } from '@/lib/vendure/mutations';
import Image from 'next/image';
import Link from 'next/link';
import { revalidateTag } from 'next/cache';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, X, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/format';

async function removeFromCart(lineId: string) {
  'use server';
  await mutate(RemoveFromCartMutation, { lineId }, { useAuthToken: true });
  revalidateTag('cart');
}

async function adjustQuantity(lineId: string, quantity: number) {
  'use server';
  await mutate(AdjustCartItemMutation, { lineId, quantity }, { useAuthToken: true });
  revalidateTag('cart');
}

async function applyPromotionCode(formData: FormData) {
  'use server';
  const code = formData.get('code') as string;
  if (!code) return;

  const res = await mutate(ApplyPromotionCodeMutation, { couponCode: code }, { useAuthToken: true });
  console.log({res: res.data.applyCouponCode})
  revalidateTag('cart');
}

async function removePromotionCode(formData: FormData) {
  'use server';
  const code = formData.get('code') as string;
  if (!code) return;

  const res = await mutate(RemovePromotionCodeMutation, { couponCode: code }, { useAuthToken: true });
  console.log({removeRes: res.data.removeCouponCode});
  revalidateTag('cart');
}

export default async function CartPage() {
  const { data } = await query(GetActiveOrderQuery, {}, { useAuthToken: true, tags: ['cart'] });
  const activeOrder = data.activeOrder;

  if (!activeOrder || activeOrder.lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to your cart to get started
          </p>
          <Button asChild>
            <Link href="/public">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {activeOrder.lines.map((line) => (
            <div
              key={line.id}
              className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card"
            >
              {line.productVariant.product.featuredAsset && (
                <Link
                  href={`/src/app/%5Blocale%5D/product/${line.productVariant.product.slug}`}
                  className="flex-shrink-0"
                >
                  <Image
                    src={line.productVariant.product.featuredAsset.preview}
                    alt={line.productVariant.name}
                    width={120}
                    height={120}
                    className="rounded-md object-cover w-full sm:w-[120px] h-[120px]"
                  />
                </Link>
              )}

              <div className="flex-grow min-w-0">
                <Link
                  href={`/src/app/%5Blocale%5D/product/${line.productVariant.product.slug}`}
                  className="font-semibold hover:underline block"
                >
                  {line.productVariant.product.name}
                </Link>
                {line.productVariant.name !== line.productVariant.product.name && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {line.productVariant.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  SKU: {line.productVariant.sku}
                </p>
                <p className="text-sm text-muted-foreground mt-2 sm:hidden">
                  {formatPrice(line.unitPriceWithTax, activeOrder.currencyCode)} each
                </p>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 border rounded-md">
                    <form
                      action={async () => {
                        'use server';
                        await adjustQuantity(line.id, Math.max(1, line.quantity - 1));
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none"
                        disabled={line.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </form>

                    <span className="w-12 text-center font-medium">{line.quantity}</span>

                    <form
                      action={async () => {
                        'use server';
                        await adjustQuantity(line.id, line.quantity + 1);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  <form
                    action={async () => {
                      'use server';
                      await removeFromCart(line.id);
                    }}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </form>

                  <div className="sm:hidden ml-auto">
                    <p className="font-semibold text-lg">
                      {formatPrice(line.linePriceWithTax, activeOrder.currencyCode)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="font-semibold text-lg">
                  {formatPrice(line.linePriceWithTax, activeOrder.currencyCode)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatPrice(line.unitPriceWithTax, activeOrder.currencyCode)} each
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 bg-card sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {formatPrice(activeOrder.subTotalWithTax, activeOrder.currencyCode)}
                </span>
              </div>
              {activeOrder.discounts && activeOrder.discounts.length > 0 && (
                <>
                  {activeOrder.discounts.map((discount, index) => (
                    <div key={index} className="flex justify-between text-sm text-green-600">
                      <span>{discount.description}</span>
                      <span>
                        {formatPrice(discount.amountWithTax, activeOrder.currencyCode)}
                      </span>
                    </div>
                  ))}
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {activeOrder.shippingWithTax > 0
                    ? formatPrice(activeOrder.shippingWithTax, activeOrder.currencyCode)
                    : 'Calculated at checkout'}
                </span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {formatPrice(activeOrder.totalWithTax, activeOrder.currencyCode)}
                </span>
              </div>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button variant="outline" className="w-full mt-2" asChild>
              <Link href="/public">Continue Shopping</Link>
            </Button>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Promotion Code
              </CardTitle>
              <CardDescription>
                Enter your discount code below
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeOrder.couponCodes && activeOrder.couponCodes.length > 0 ? (
                <div className="space-y-2">
                  {activeOrder.couponCodes.map((code) => (
                    <div key={code} className="flex items-center justify-between p-3 border rounded-md bg-green-50 dark:bg-green-950/20">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm">{code}</span>
                      </div>
                      <form action={removePromotionCode}>
                        <input type="hidden" name="code" value={code} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Remove
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              ) : (
                <form action={applyPromotionCode} className="flex gap-2">
                  <Input
                    type="text"
                    name="code"
                    placeholder="Enter code"
                    className="flex-1"
                    required
                  />
                  <Button type="submit">Apply</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
