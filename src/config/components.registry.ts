/**
 * Component Registry - Unified Export
 *
 * This file provides unified access to both client and server component registries.
 *
 * IMPORTANT: Use the correct registry based on your component type:
 * - In 'use client' components: import { ClientComponents } from '@config/components.client.registry'
 * - In server components: import { ServerComponents } from '@config/components.server.registry'
 *
 * This file re-exports both for convenience in files that need both.
 */

// Re-export client registry
export {ClientComponents} from './components.client.registry';
export type {
    ClientComponentRegistry,
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
} from './components.client.registry';

// Re-export server registry
export {ServerComponents} from './components.server.registry';
export type {
    ServerComponentRegistry,
    NavbarProps,
    FooterProps,
    HeroSectionProps,
    FeaturedProductsProps,
    RelatedProductsProps,
    ProductGridProps,
    ProductGridSkeletonProps,
} from './components.server.registry';
