import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-9 w-32 mb-8" />

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Checkout Steps */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                {i < 3 && <Skeleton className="h-1 w-16 mx-2" />}
                            </div>
                        ))}
                    </div>

                    {/* Shipping Address Form */}
                    <div className="border rounded-lg p-6 space-y-4">
                        <Skeleton className="h-6 w-40" />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="border rounded-lg p-6 space-y-4 sticky top-24">
                        <Skeleton className="h-6 w-32" />

                        {/* Order Items */}
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex gap-3">
                                    <Skeleton className="h-16 w-16 rounded-md" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t">
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
