'use client';

import Image from 'next/image';
import {formatPrice} from '@/lib/format';
import {useChannel} from '@/providers/channel-provider';
import {Link} from "@/i18n/navigation";
import {FragmentOf, readFragment} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';

interface ProductCardProps {
    product: FragmentOf<typeof ProductCardFragment>;
}

export function ProductCard({product: productProp}: ProductCardProps) {
    const product = readFragment(ProductCardFragment, productProp);
    const {currencyCode} = useChannel();

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow"
        >
            <div className="aspect-square relative bg-muted">
                {product.productAsset ? (
                    <Image
                        src={product.productAsset.preview}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {product.productName}
                </h3>
                <p className="text-lg font-bold">
                    {product.priceWithTax.__typename === 'PriceRange' ? (
                        <>
                            from {formatPrice(product.priceWithTax.min, currencyCode)}
                        </>
                    ) : product.priceWithTax.__typename === 'SinglePrice' ? (
                        formatPrice(product.priceWithTax.value, currencyCode)
                    ) : null}
                </p>
            </div>
        </Link>
    );
}
