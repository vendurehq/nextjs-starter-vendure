import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AddressesLoading() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Addresses</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your saved shipping and billing addresses
                </p>
            </div>

            <div className="flex justify-between items-center">
                <div></div>
                <Skeleton className="h-10 w-40" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-56" />
                                <Skeleton className="h-4 w-44" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
