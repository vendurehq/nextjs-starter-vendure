'use client';

/**
 * Client Component Registry
 *
 * Registry for client-side components only.
 * These components use 'use client' and can be safely imported in client components.
 *
 * To override a component:
 * 1. Create your custom component in @merchant/components/overrides/
 * 2. Change the import below from @core to @merchant
 */

import type {ComponentType} from 'react';
import type {FragmentOf, ResultOf} from '@/graphql';
import type {ProductCardFragment} from '@core/lib/vendure/fragments';
import type {SearchProductsQuery} from '@core/lib/vendure/queries';

// ============================================================================
// Component Prop Types
// ============================================================================
export interface ProductCardProps {
    product: FragmentOf<typeof ProductCardFragment>;
}

export interface PriceProps {
    value: number;
    currencyCode?: string;
}

export interface OrderStatusBadgeProps {
    state: string;
}

export interface CountrySelectProps {
    countries: Array<{ code: string; name: string }>;
    value?: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
}

export interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        description: string;
        variants: Array<{
            id: string;
            name: string;
            sku: string;
            priceWithTax: number;
            stockLevel: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
                groupId: string;
                group: {
                    id: string;
                    code: string;
                    name: string;
                };
            }>;
        }>;
        optionGroups: Array<{
            id: string;
            code: string;
            name: string;
            options: Array<{
                id: string;
                code: string;
                name: string;
            }>;
        }>;
    };
    searchParams: { [key: string]: string | string[] | undefined };
}

export interface ProductImageCarouselProps {
    images: Array<{
        id: string;
        preview: string;
        source: string;
    }>;
}

export interface ProductCarouselProps {
    title: string;
    products: Array<FragmentOf<typeof ProductCardFragment>>;
}

export interface SearchInputProps {
    className?: string;
}

export interface FacetFiltersProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

// ============================================================================
// Registry Type Definition
// ============================================================================
export interface ClientComponentRegistry {
    ProductCard: ComponentType<ProductCardProps>;
    Price: ComponentType<PriceProps>;
    OrderStatusBadge: ComponentType<OrderStatusBadgeProps>;
    CountrySelect: ComponentType<CountrySelectProps>;
    ProductInfo: ComponentType<ProductInfoProps>;
    ProductImageCarousel: ComponentType<ProductImageCarouselProps>;
    ProductCarousel: ComponentType<ProductCarouselProps>;
    SearchInput: ComponentType<SearchInputProps>;
    FacetFilters: ComponentType<FacetFiltersProps>;
    Pagination: ComponentType<PaginationProps>;
}

// ============================================================================
// Component Imports - Change these to use merchant overrides
// ============================================================================

// Merchant override (comment out core import, uncomment merchant import)
import {ProductCard} from '@merchant/components/overrides/ProductCard';
// import {ProductCard} from '@core/components/commerce/product-card';

import {Price} from '@core/components/commerce/price';
import {OrderStatusBadge} from '@core/components/commerce/order-status-badge';
import {CountrySelect} from '@core/components/shared/country-select';
import {ProductInfo} from '@core/components/commerce/product-info';
import {ProductImageCarousel} from '@core/components/commerce/product-image-carousel';
import {ProductCarousel} from '@core/components/commerce/product-carousel';
import {SearchInput} from '@core/components/layout/search-input';
import {FacetFilters} from '@core/components/commerce/facet-filters';
import {Pagination} from '@core/components/shared/pagination';

// ============================================================================
// Export Client Components Object
// ============================================================================
export const ClientComponents: ClientComponentRegistry = {
    ProductCard,
    Price,
    OrderStatusBadge,
    CountrySelect,
    ProductInfo,
    ProductImageCarousel,
    ProductCarousel,
    SearchInput,
    FacetFilters,
    Pagination,
};
