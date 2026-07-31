import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Skeleton} from '@/components/ui/skeleton';

export default function OrdersLoading() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">My Orders</h1>

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
                        {Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <Skeleton className="h-9 w-32"/>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24"/>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-20"/>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16"/>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-4 w-20 ml-auto"/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
