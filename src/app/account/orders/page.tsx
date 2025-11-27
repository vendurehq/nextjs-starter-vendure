import {query} from '@/lib/vendure/api';
import {GetCustomerOrdersQuery} from '@/lib/vendure/queries';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
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
import {Price} from '@/components/price';
import Link from "next/link";
import {redirect} from "next/navigation";

const ITEMS_PER_PAGE = 10;

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatPrice(price: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(price / 100);
}

function getStatusColor(state: string) {
    const stateColors: Record<string, string> = {
        PaymentSettled: 'bg-green-100 text-green-800',
        Delivered: 'bg-blue-100 text-blue-800',
        Shipped: 'bg-purple-100 text-purple-800',
        Cancelled: 'bg-red-100 text-red-800',
        Draft: 'bg-gray-100 text-gray-800',
    };
    return stateColors[state] || 'bg-gray-100 text-gray-800';
}

export default async function OrdersPage(props: {
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ page?: string }>
}) {
    const searchParams = await props.searchParams;
    const currentPage = parseInt(searchParams.page || '1', 10);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const params = await props.params

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
        return redirect('/sign-in');
    }

    const orders = data.activeCustomer.orders.items;
    const totalItems = data.activeCustomer.orders.totalItems;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">You haven&apos;t placed any orders yet.</p>
                </div>
            ) : (
                <>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>Order Number</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <Button asChild variant="outline">
                                                <Link
                                                    href={`/account/orders/${order.code}`}
                                                >
                                                    {order.code} <ArrowRightIcon/>
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(order.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getStatusColor(order.state)}
                                                variant="secondary"
                                            >
                                                {order.state}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {order.lines.length}{' '}
                                            {order.lines.length === 1 ? 'item' : 'items'}
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
                                                            href={`/src/app/%5Blocale%5D/account/orders?page=${page}`}
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
