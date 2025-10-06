import { query } from '@/lib/vendure/api';
import { graphql } from '@/graphql';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

const GetOrderByCodeQuery = graphql(`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      id
      code
      state
      totalWithTax
      currencyCode
      lines {
        id
        productVariant {
          id
          name
          product {
            id
            name
            slug
            featuredAsset {
              id
              preview
            }
          }
        }
        quantity
        linePriceWithTax
      }
      shippingAddress {
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        country
      }
    }
  }
`);

export default async function OrderConfirmationPage({ params }: { params: { code: string } }) {
  const { data } = await query(GetOrderByCodeQuery, { code: params.code }, { useAuthToken: true });
  const order = data.orderByCode;

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find an order with that code.
          </p>
          <Button asChild>
            <Link href="/public">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. Your order number is
            <span className="font-semibold">{order.code}</span>
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.lines.map((line) => (
              <div key={line.id} className="flex gap-4">
                {line.productVariant.product.featuredAsset && (
                  <div className="flex-shrink-0">
                    <Image
                      src={line.productVariant.product.featuredAsset.preview}
                      alt={line.productVariant.name}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{line.productVariant.product.name}</p>
                  {line.productVariant.name !== line.productVariant.product.name && (
                    <p className="text-sm text-muted-foreground">
                      {line.productVariant.name}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">Qty: {line.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {(line.linePriceWithTax / 100).toLocaleString('en-US', {
                      style: 'currency',
                      currency: order.currencyCode,
                    })}
                  </p>
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>
                {(order.totalWithTax / 100).toLocaleString('en-US', {
                  style: 'currency',
                  currency: order.currencyCode,
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {order.shippingAddress && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {order.shippingAddress.streetLine1}
                {order.shippingAddress.streetLine2 && `, ${order.shippingAddress.streetLine2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <Button asChild className="flex-1">
            <Link href="/public">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
