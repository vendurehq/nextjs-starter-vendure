import { ServerComponents } from '@config/components.server.registry';

export function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
                <div className="h-64 animate-pulse bg-muted rounded-lg" />
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3">
                <ServerComponents.ProductGridSkeleton />
            </div>
        </div>
    );
}
