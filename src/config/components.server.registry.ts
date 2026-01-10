/**
 * Server Component Registry
 *
 * Registry for server-side components only.
 * These components can use server-only features like async/await, 'use cache', etc.
 *
 * To override a component:
 * 1. Create your custom component in @merchant/components/overrides/
 * 2. Change the import below from @core to @merchant
 */

import type {ComponentType} from 'react';

// ============================================================================
// Component Imports - Change these to use merchant overrides
// ============================================================================

// Layout
import {Navbar} from '@core/components/layout/navbar';
import {Footer} from '@core/components/layout/footer';
import {HeroSection} from '@core/components/layout/hero-section';

// Commerce (server)
import {FeaturedProducts} from '@core/components/commerce/featured-products';
import {RelatedProducts} from '@core/components/commerce/related-products';
import {ProductGrid} from '@core/components/commerce/product-grid';

// Shared
import {ProductGridSkeleton} from '@core/components/shared/product-grid-skeleton';

// ============================================================================
// Props Type Imports
// ============================================================================
import type {NavbarProps} from '@core/components/layout/navbar';
import type {FooterProps} from '@core/components/layout/footer';
import type {HeroSectionProps} from '@core/components/layout/hero-section';
import type {FeaturedProductsProps} from '@core/components/commerce/featured-products';
import type {RelatedProductsProps} from '@core/components/commerce/related-products';
import type {ProductGridProps} from '@core/components/commerce/product-grid';
import type {ProductGridSkeletonProps} from '@core/components/shared/product-grid-skeleton';

// Re-export Props types for consumers
export type {
    NavbarProps,
    FooterProps,
    HeroSectionProps,
    FeaturedProductsProps,
    RelatedProductsProps,
    ProductGridProps,
    ProductGridSkeletonProps,
};

// ============================================================================
// Registry Type Definition
// ============================================================================
export interface ServerComponentRegistry {
    // Layout
    Navbar: ComponentType<NavbarProps>;
    Footer: ComponentType<FooterProps>;
    HeroSection: ComponentType<HeroSectionProps>;

    // Commerce (server)
    FeaturedProducts: ComponentType<FeaturedProductsProps>;
    RelatedProducts: ComponentType<RelatedProductsProps>;
    ProductGrid: ComponentType<ProductGridProps>;

    // Shared
    ProductGridSkeleton: ComponentType<ProductGridSkeletonProps>;
}

// ============================================================================
// Export Server Components Object
// ============================================================================
export const ServerComponents: ServerComponentRegistry = {
    // Layout
    Navbar,
    Footer,
    HeroSection,

    // Commerce (server)
    FeaturedProducts,
    RelatedProducts,
    ProductGrid,

    // Shared
    ProductGridSkeleton,
};
