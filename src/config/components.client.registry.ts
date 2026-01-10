/**
 * Client Component Registry
 *
 * Registry for client-side components.
 * These components have 'use client' directives in their source files.
 * This registry file does NOT need 'use client' - it's just a re-export barrel.
 *
 * To override a component:
 * 1. Create your custom component in @merchant/components/overrides/
 * 2. Change the import below from @core to @merchant
 */

import type {ComponentType} from 'react';

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
// Props Type Imports
// ============================================================================
import type {ProductCardProps} from '@core/components/commerce/product-card';
import type {PriceProps} from '@core/components/commerce/price';
import type {OrderStatusBadgeProps} from '@core/components/commerce/order-status-badge';
import type {CountrySelectProps} from '@core/components/shared/country-select';
import type {ProductInfoProps} from '@core/components/commerce/product-info';
import type {ProductImageCarouselProps} from '@core/components/commerce/product-image-carousel';
import type {ProductCarouselProps} from '@core/components/commerce/product-carousel';
import type {SearchInputProps} from '@core/components/layout/search-input';
import type {FacetFiltersProps} from '@core/components/commerce/facet-filters';
import type {PaginationProps} from '@core/components/shared/pagination';

// Re-export Props types for consumers
export type {
    ProductCardProps,
    PriceProps,
    OrderStatusBadgeProps,
    CountrySelectProps,
    ProductInfoProps,
    ProductImageCarouselProps,
    ProductCarouselProps,
    SearchInputProps,
    FacetFiltersProps,
    PaginationProps,
};

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
