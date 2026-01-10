/**
 * Merchant ProductCard Override Example
 *
 * This is an example of how to override a core component.
 * Copy the core component and make your customizations here.
 *
 * To enable this override:
 * 1. Open src/config/components.config.ts
 * 2. Comment out: import { ProductCard } from '@core/components/commerce/product-card';
 * 3. Uncomment: import { ProductCard } from '@merchant/components/overrides/ProductCard';
 *
 * Customizations in this example:
 * - Rounded corners with thicker border
 * - Primary-colored border on hover
 * - "Quick View" button appears on image hover
 * - Price is always shown in primary color
 * - Subtle gradient overlay on images
 */

import Image from 'next/image';
import Link from 'next/link';
import {Suspense} from 'react';
import {readFragment} from '@/graphql';
import {ProductCardFragment} from '@core/lib/vendure/fragments';
import {ClientComponents} from '@config/components.client.registry';
import type {ProductCardProps} from '@core/components/commerce/product-card';

export function ProductCard({product: productProp}: ProductCardProps) {
  const product = readFragment(ProductCardFragment, productProp);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-card rounded-xl overflow-hidden border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-300"
      data-component="product-card"
    >
      <div className="aspect-square relative bg-muted overflow-hidden">
        {product.productAsset ? (
          <Image
            src={product.productAsset.preview}
            alt={product.productName}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}

        {/* Merchant customization: Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Merchant customization: Quick View button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-white/90 text-black text-sm font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
            Quick View
          </span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {product.productName}
        </h3>
        <Suspense fallback={<div className="h-8 w-36 rounded bg-muted"></div>}>
          {/* Merchant customization: Price always in primary color */}
          <p className="text-lg font-bold text-primary">
            {product.priceWithTax.__typename === 'PriceRange' ? (
              product.priceWithTax.min !== product.priceWithTax.max ? (
                <>
                  from <ClientComponents.Price value={product.priceWithTax.min} />
                </>
              ) : (
                <ClientComponents.Price value={product.priceWithTax.min} />
              )
            ) : product.priceWithTax.__typename === 'SinglePrice' ? (
              <ClientComponents.Price value={product.priceWithTax.value} />
            ) : null}
          </p>
        </Suspense>
      </div>
    </Link>
  );
}
