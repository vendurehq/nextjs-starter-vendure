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
import type {ResultOf} from '@/graphql';
import type {SearchProductsQuery} from '@core/lib/vendure/queries';

// ============================================================================
// Component Prop Types
// ============================================================================
export interface NavbarProps {}

export interface FooterProps {}

export interface HeroSectionProps {}

export interface FeaturedProductsProps {}

export interface RelatedProductsProps {
    collectionSlug: string;
    currentProductId: string;
}

export interface ProductGridProps {
    productDataPromise: Promise<{
        data: ResultOf<typeof SearchProductsQuery>;
        token?: string;
    }>;
    currentPage: number;
    take: number;
}

export interface ProductGridSkeletonProps {}

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
