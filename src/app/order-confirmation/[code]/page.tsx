import {Suspense} from 'react';
import {OrderConfirmation} from './order-confirmation';

export default async function OrderConfirmationPage(props: PageProps<'/order-confirmation/[code]'>) {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
            <OrderConfirmation {...props} />
        </Suspense>
    );
}
