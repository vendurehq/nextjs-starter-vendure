import type {Metadata} from 'next';
import {query} from '@/platform/vendure/api';
import {GetCustomerOrdersQuery} from '@/features/account/graphql';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {ArrowRightIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Price} from '@/features/pricing/price';
import {OrderStatusBadge} from '@/features/orders/order-status-badge';
import {formatDate} from '@/platform/i18n/format';
import { Link, redirect } from '@/platform/i18n/navigation';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Account'});
    return {
        title: t('ordersPageTitle'),
    };
}

const ITEMS_PER_PAGE = 10;

export default async function OrdersPage(props: PageProps<'/[locale]/account/orders'>) {
    const searchParams = await props.searchParams;
    const locale = await getRouteLocale();
    const pageParam = searchParams.page;
    const currentPage = parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam || '1', 10);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;

    const {data} = await query(
        GetCustomerOrdersQuery,
        {
            options: {
                take: ITEMS_PER_PAGE,
                skip,
                filter: {
                    state: {
                        notEq: 'AddingItems',
                    },
                },
            },
        },
        {useAuthToken: true}
    );

    if (!data.activeCustomer) {
        return redirect({href: '/sign-in', locale});
    }
    const t = await getTranslations({locale, namespace: 'Account'});

    const orders = data.activeCustomer.orders.items;
    const totalItems = data.activeCustomer.orders.totalItems;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">{t('myOrders')}</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">{t('noOrders')}</p>
                </div>
            ) : (
                <>
                    {/* Mobile: Card-based layout */}
                    <div className="md:hidden space-y-3">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/account/orders/${order.code}`}
                                className="block border rounded-xl p-4 bg-card hover:bg-muted/30 transition-colors duration-200"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-semibold">#{order.code}</span>
                                    <OrderStatusBadge state={order.state}/>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">{formatDate(order.createdAt, 'short', locale)}</span>
                                    <span className="font-medium text-base">
                                        <Price value={order.totalWithTax} currencyCode={order.currencyCode}/>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        {order.lines.length} {order.lines.length === 1 ? t('item') : t('items')}
                                    </span>
                                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground"/>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: Table layout */}
                    <div className="hidden md:block border rounded-lg">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>{t('orderNumber')}</TableHead>
                                    <TableHead>{t('date')}</TableHead>
                                    <TableHead>{t('status')}</TableHead>
                                    <TableHead>{t('itemsHeader')}</TableHead>
                                    <TableHead className="text-right">{t('totalHeader')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <Button nativeButton={false} render={<Link href={`/account/orders/${order.code}`} />} variant="outline">
                                                    {order.code} <ArrowRightIcon/>
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(order.createdAt, 'short', locale)}
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge state={order.state}/>
                                        </TableCell>
                                        <TableCell>
                                            {order.lines.length}{' '}
                                            {order.lines.length === 1 ? t('item') : t('items')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Price value={order.totalWithTax} currencyCode={order.currencyCode}/>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={
                                                currentPage > 1
                                                    ? `/account/orders?page=${currentPage - 1}`
                                                    : '#'
                                            }
                                            className={
                                                currentPage === 1
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>

                                    {Array.from({length: totalPages}, (_, i) => i + 1).map(
                                        (page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 &&
                                                    page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationLink
                                                            href={`/account/orders?page=${page}`}
                                                            isActive={page === currentPage}
                                                        >
                                                            {page}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return (
                                                    <PaginationItem key={page}>
                                                        <PaginationEllipsis/>
                                                    </PaginationItem>
                                                );
                                            }
                                            return null;
                                        }
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                currentPage < totalPages
                                                    ? `/account/orders?page=${currentPage + 1}`
                                                    : '#'
                                            }
                                            className={
                                                currentPage === totalPages
                                                    ? 'pointer-events-none opacity-50'
                                                    : ''
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
