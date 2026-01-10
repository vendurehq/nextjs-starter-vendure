import Image from 'next/image';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Minus, Plus, X} from 'lucide-react';
import {ClientComponents} from '@config/components.client.registry';
import {removeFromCart, adjustQuantity} from './actions';

type ActiveOrder = {
    id: string;
    currencyCode: string;
    lines: Array<{
        id: string;
        quantity: number;
        unitPriceWithTax: number;
        linePriceWithTax: number;
        productVariant: {
            id: string;
            name: string;
            sku: string;
            product: {
                name: string;
                slug: string;
                featuredAsset?: {
                    preview: string;
                } | null;
            };
        };
    }>;
};

export async function CartItems({activeOrder}: { activeOrder: ActiveOrder | null }) {
    if (!activeOrder || activeOrder.lines.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                    <p className="text-muted-foreground mb-8">
                        Add some items to your cart to get started
                    </p>
                    <Button asChild>
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:col-span-2 space-y-4">
            {activeOrder.lines.map((line) => (
                <div
                    key={line.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-card"
                >
                    {line.productVariant.product.featuredAsset && (
                        <Link
                            href={`/src/app/%5Blocale%5D/product/${line.productVariant.product.slug}`}
                            className="flex-shrink-0"
                        >
                            <Image
                                src={line.productVariant.product.featuredAsset.preview}
                                alt={line.productVariant.name}
                                width={120}
                                height={120}
                                className="rounded-md object-cover w-full sm:w-[120px] h-[120px]"
                            />
                        </Link>
                    )}

                    <div className="flex-grow min-w-0">
                        <Link
                            href={`/src/app/%5Blocale%5D/product/${line.productVariant.product.slug}`}
                            className="font-semibold hover:underline block"
                        >
                            {line.productVariant.product.name}
                        </Link>
                        {line.productVariant.name !== line.productVariant.product.name && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {line.productVariant.name}
                            </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            SKU: {line.productVariant.sku}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 sm:hidden">
                            <ClientComponents.Price value={line.unitPriceWithTax} currencyCode={activeOrder.currencyCode}/> each
                        </p>

                        <div className="flex items-center gap-3 mt-4">
                            <div className="flex items-center gap-2 border rounded-md">
                                <form
                                    action={async () => {
                                        'use server';
                                        await adjustQuantity(line.id, Math.max(1, line.quantity - 1));
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-none"
                                        disabled={line.quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4"/>
                                    </Button>
                                </form>

                                <span className="w-12 text-center font-medium">{line.quantity}</span>

                                <form
                                    action={async () => {
                                        'use server';
                                        await adjustQuantity(line.id, line.quantity + 1);
                                    }}
                                >
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-none"
                                    >
                                        <Plus className="h-4 w-4"/>
                                    </Button>
                                </form>
                            </div>

                            <form
                                action={async () => {
                                    'use server';
                                    await removeFromCart(line.id);
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="h-5 w-5"/>
                                </Button>
                            </form>

                            <div className="sm:hidden ml-auto">
                                <p className="font-semibold text-lg">
                                    <ClientComponents.Price value={line.linePriceWithTax}
                                           currencyCode={activeOrder.currencyCode}/>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block text-right flex-shrink-0">
                        <p className="font-semibold text-lg">
                            <ClientComponents.Price value={line.linePriceWithTax} currencyCode={activeOrder.currencyCode}/>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            <ClientComponents.Price value={line.unitPriceWithTax} currencyCode={activeOrder.currencyCode}/> each
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
