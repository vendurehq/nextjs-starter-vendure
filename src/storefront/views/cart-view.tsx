import {Suspense} from 'react';
import {Cart} from '@/components/commerce/cart/cart';
import {CartSkeleton} from '@/components/shared/skeletons/cart-skeleton';

interface CartViewProps {
    title: string;
}

export function CartView({title}: CartViewProps) {
    return (
        <div className="container mx-auto px-4 py-20">
            <h1 className="text-3xl font-bold mb-8">{title}</h1>

            <Suspense fallback={<CartSkeleton />}>
                <Cart/>
            </Suspense>
        </div>
    );
}
