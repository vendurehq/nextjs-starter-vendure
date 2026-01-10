import { ServerComponents } from '@config/components.server.registry';

export default function CollectionLoading() {
    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar Skeleton */}
                <aside className="lg:col-span-1">
                    <div className="h-64 animate-pulse bg-muted rounded-lg" />
                </aside>

                {/* Product Grid Skeleton */}
                <div className="lg:col-span-3">
                    <ServerComponents.ProductGridSkeleton />
                </div>
            </div>
        </div>
    );
}
