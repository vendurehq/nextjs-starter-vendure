import type {Metadata} from 'next';
import {ChevronLeft} from 'lucide-react';
import {query} from '@core/lib/vendure/api';
import {GetOrderDetailQuery} from '@core/lib/vendure/queries';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import Image from 'next/image';
import {getActiveCustomer} from "@core/lib/vendure/actions";
import {notFound, redirect} from "next/navigation";
import {ClientComponents} from '@config/components.client.registry';
import {formatDate} from '@core/lib/format';
import Link from "next/link";

type OrderDetailPageProps = PageProps<'/account/orders/[code]'>;

export async function generateMetadata({params}: OrderDetailPageProps): Promise<Metadata> {
    const {code} = await params;
    return {
        title: `Order ${code}`,
    };
}

export default async function OrderDetailPage(props: PageProps<'/account/orders/[code]'>) {
    const params = await props.params;
    const {code} = params;
    const activeCustomer = await getActiveCustomer();

    const {data} = await query(
        GetOrderDetailQuery,
        {code},
        {useAuthToken: true, fetch: {}}
    );

    if (!data.orderByCode) {
        return redirect('/account/orders');
    }

    if (data.orderByCode.customer?.id !== activeCustomer?.id) {
        return notFound();
    }

    const order = data.orderByCode;

    return (
        <div>
            <div className="mb-6">
                <Button variant="ghost" size="sm" asChild className="mb-4">
                    <Link href="/account/orders">
                        <ChevronLeft className="h-4 w-4 mr-2"/>
                        Back to Orders
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Order {order.code}</h1>
                        <p className="text-muted-foreground mt-1">
                            Placed on {formatDate(order.createdAt, 'long')}
                        </p>
                    </div>
                    <ClientComponents.OrderStatusBadge state={order.state}/>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Items and Totals */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.lines.map((line) => (
                                    <div key={line.id} className="flex gap-4">
                                        <div
                                            className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                            {line.productVariant.product.featuredAsset && (
                                                <Image
                                                    src={line.productVariant.product.featuredAsset.preview}
                                                    alt={line.productVariant.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Link
                                                href={`/product/${line.productVariant.product.slug}`}
                                                className="font-medium hover:underline"
                                            >
                                                {line.productVariant.product.name}
                                            </Link>
                                            <p className="text-sm text-muted-foreground">
                                                {line.productVariant.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                SKU: {line.productVariant.sku}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                <ClientComponents.Price value={line.linePriceWithTax} currencyCode={order.currencyCode}/>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Qty: {line.quantity} × <ClientComponents.Price value={line.unitPriceWithTax}
                                                                              currencyCode={order.currencyCode}/>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Totals */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span><ClientComponents.Price value={order.subTotalWithTax}
                                                 currencyCode={order.currencyCode}/></span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span><ClientComponents.Price value={order.shippingWithTax}
                                                 currencyCode={order.currencyCode}/></span>
                                </div>
                                {order.discounts.length > 0 && (
                                    <>
                                        {order.discounts.map((discount, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">
                                                    {discount.description}
                                                </span>
                                                <span className="text-green-600">
                                                    -<ClientComponents.Price value={discount.amountWithTax}
                                                            currencyCode={order.currencyCode}/>
                                                </span>
                                            </div>
                                        ))}
                                    </>
                                )}
                                <Separator className="my-2"/>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span><ClientComponents.Price value={order.totalWithTax} currencyCode={order.currencyCode}/></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Shipping, Billing, Payment */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Address</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                {order.shippingAddress.company && (
                                    <p>{order.shippingAddress.company}</p>
                                )}
                                <p>{order.shippingAddress.streetLine1}</p>
                                {order.shippingAddress.streetLine2 && (
                                    <p>{order.shippingAddress.streetLine2}</p>
                                )}
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                                    {order.shippingAddress.postalCode}
                                </p>
                                <p>{order.shippingAddress.country}</p>
                                {order.shippingAddress.phoneNumber && (
                                    <p className="mt-2">{order.shippingAddress.phoneNumber}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Billing Address */}
                    {order.billingAddress && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Address</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm">
                                <p className="font-medium">{order.billingAddress.fullName}</p>
                                {order.billingAddress.company && (
                                    <p>{order.billingAddress.company}</p>
                                )}
                                <p>{order.billingAddress.streetLine1}</p>
                                {order.billingAddress.streetLine2 && (
                                    <p>{order.billingAddress.streetLine2}</p>
                                )}
                                <p>
                                    {order.billingAddress.city}, {order.billingAddress.province}{' '}
                                    {order.billingAddress.postalCode}
                                </p>
                                <p>{order.billingAddress.country}</p>
                                {order.billingAddress.phoneNumber && (
                                    <p className="mt-2">{order.billingAddress.phoneNumber}</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Information */}
                    {order.payments && order.payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.payments.map((payment) => (
                                    <div key={payment.id} className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Method</span>
                                            <span className="font-medium">{payment.method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Amount</span>
                                            <span><ClientComponents.Price value={payment.amount}
                                                         currencyCode={order.currencyCode}/></span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {payment.state}
                                            </Badge>
                                        </div>
                                        {payment.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Transaction ID</span>
                                                <span className="font-mono text-xs">
                                                    {payment.transactionId}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Shipping Method */}
                    {order.shippingLines && order.shippingLines.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Method</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {order.shippingLines.map((line, idx) => (
                                    <div key={idx} className="space-y-1 text-sm">
                                        <p className="font-medium">{line.shippingMethod.name}</p>
                                        {line.shippingMethod.description && (
                                            <p className="text-muted-foreground">
                                                {line.shippingMethod.description}
                                            </p>
                                        )}
                                        <p className="font-medium">
                                            <ClientComponents.Price value={line.priceWithTax} currencyCode={order.currencyCode}/>
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
