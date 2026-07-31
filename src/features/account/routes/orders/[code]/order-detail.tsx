'use client';

import {use} from 'react';
import {ChevronLeft} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Badge} from '@/components/ui/badge';
import Image from 'next/image';
import {Link} from '@/platform/i18n/navigation';
import {Price} from '@/features/pricing/price';
import {OrderStatusBadge} from '@/features/orders/order-status-badge';
import {formatDate} from '@/platform/i18n/format';
import {useLocale, useTranslations} from 'next-intl';
import type {ResultOf} from '@/platform/vendure/graphql';
import type {GetOrderDetailQuery} from '@/features/account/graphql';

type OrderByCode = NonNullable<ResultOf<typeof GetOrderDetailQuery>['orderByCode']>;
type OrderLineItem = OrderByCode['lines'][number];
type OrderDiscount = OrderByCode['discounts'][number];
type OrderPayment = NonNullable<OrderByCode['payments']>[number];
type OrderShippingLine = NonNullable<OrderByCode['shippingLines']>[number];

interface OrderDetailProps {
    orderPromise: Promise<{ data: ResultOf<typeof GetOrderDetailQuery>; token?: string }>;
}

export function OrderDetail({orderPromise}: OrderDetailProps) {
    const {data} = use(orderPromise);
    const locale = useLocale();
    const t = useTranslations('Account');
    const order = data.orderByCode;

    if (!order) {
        return null;
    }

    return (
        <div>
            <div className="mb-6">
                <Button render={<Link href="/account/orders" />} nativeButton={false} variant="ghost" size="sm" className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2"/>
                        {t('backToOrders')}
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t('order', {code: order.code})}</h1>
                        <p className="text-muted-foreground mt-1">
                            {t('placedOn', {date: formatDate(order.createdAt, 'long', locale)})}
                        </p>
                    </div>
                    <OrderStatusBadge state={order.state}/>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orderItems')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.lines.map((line: OrderLineItem) => (
                                    <div key={line.id} className="flex gap-4">
                                        <div className="relative h-20 w-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
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
                                                {t('skuLabel', {sku: line.productVariant.sku})}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                <Price value={line.linePriceWithTax} currencyCode={order.currencyCode}/>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t('qty', {quantity: line.quantity})} × <Price value={line.unitPriceWithTax} currencyCode={order.currencyCode}/>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{t('orderSummary')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('subtotal')}</span>
                                    <span><Price value={order.subTotalWithTax} currencyCode={order.currencyCode}/></span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t('shipping')}</span>
                                    <span><Price value={order.shippingWithTax} currencyCode={order.currencyCode}/></span>
                                </div>
                                {order.discounts?.length > 0 && order.discounts.map((discount: OrderDiscount, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{discount.description}</span>
                                        <span className="text-green-600">
                                            -<Price value={discount.amountWithTax} currencyCode={order.currencyCode}/>
                                        </span>
                                    </div>
                                ))}
                                <Separator className="my-2"/>
                                <div className="flex justify-between font-bold text-lg">
                                    <span>{t('total')}</span>
                                    <span><Price value={order.totalWithTax} currencyCode={order.currencyCode}/></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {order.shippingAddress && (
                        <Card>
                            <CardHeader><CardTitle>{t('shippingAddress')}</CardTitle></CardHeader>
                            <CardContent className="text-sm">
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                                <p>{order.shippingAddress.streetLine1}</p>
                                {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                                {order.shippingAddress.phoneNumber && <p className="mt-2">{order.shippingAddress.phoneNumber}</p>}
                            </CardContent>
                        </Card>
                    )}

                    {order.billingAddress && (
                        <Card>
                            <CardHeader><CardTitle>{t('billingAddress')}</CardTitle></CardHeader>
                            <CardContent className="text-sm">
                                <p className="font-medium">{order.billingAddress.fullName}</p>
                                {order.billingAddress.company && <p>{order.billingAddress.company}</p>}
                                <p>{order.billingAddress.streetLine1}</p>
                                {order.billingAddress.streetLine2 && <p>{order.billingAddress.streetLine2}</p>}
                                <p>{order.billingAddress.city}, {order.billingAddress.province} {order.billingAddress.postalCode}</p>
                                <p>{order.billingAddress.country}</p>
                                {order.billingAddress.phoneNumber && <p className="mt-2">{order.billingAddress.phoneNumber}</p>}
                            </CardContent>
                        </Card>
                    )}

                    {order.payments && order.payments.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>{t('payment')}</CardTitle></CardHeader>
                            <CardContent>
                                {order.payments.map((payment: OrderPayment) => (
                                    <div key={payment.id} className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('method')}</span>
                                            <span className="font-medium">{payment.method}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('amount')}</span>
                                            <span><Price value={payment.amount} currencyCode={order.currencyCode}/></span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">{t('paymentStatus')}</span>
                                            <Badge variant="secondary" className="text-xs">{payment.state}</Badge>
                                        </div>
                                        {payment.transactionId && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">{t('transactionId')}</span>
                                                <span className="font-mono text-xs">{payment.transactionId}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {order.shippingLines?.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>{t('shippingMethod')}</CardTitle></CardHeader>
                            <CardContent>
                                {order.shippingLines.map((line: OrderShippingLine, idx: number) => (
                                    <div key={idx} className="space-y-1 text-sm">
                                        <p className="font-medium">{line.shippingMethod.name}</p>
                                        {line.shippingMethod.description && (
                                            <p className="text-muted-foreground">{line.shippingMethod.description}</p>
                                        )}
                                        <p className="font-medium">
                                            <Price value={line.priceWithTax} currencyCode={order.currencyCode}/>
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
