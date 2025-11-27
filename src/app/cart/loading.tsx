import { CartSkeleton } from '@/components/skeletons/cart-skeleton';

export default function CartLoading() {
    return (
        <div className="container mx-auto px-4 py-20">
            <div className="h-9 w-48 bg-muted animate-pulse rounded mb-8" />
            <CartSkeleton />
        </div>
    );
}
