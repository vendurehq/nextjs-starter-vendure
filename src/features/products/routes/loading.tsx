import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left Column: Image Carousel Skeleton */}
                <div className="lg:sticky lg:top-20 lg:self-start">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="flex gap-2 mt-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-16 rounded-md" />
                        ))}
                    </div>
                </div>

                {/* Right Column: Product Info Skeleton */}
                <div className="space-y-6">
                    {/* Product Title */}
                    <div>
                        <Skeleton className="h-9 w-3/4" />
                        <Skeleton className="h-8 w-24 mt-2" />
                    </div>

                    {/* Product Description */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    {/* Option Groups */}
                    <div className="space-y-4">
                        <Skeleton className="h-5 w-16" />
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-md" />
                            ))}
                        </div>
                    </div>

                    {/* Stock Status */}
                    <Skeleton className="h-4 w-20" />

                    {/* Add to Cart Button */}
                    <Skeleton className="h-12 w-full" />

                    {/* SKU */}
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        </div>
    );
}
