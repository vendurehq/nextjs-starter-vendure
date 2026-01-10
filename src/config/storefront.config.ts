/**
 * Storefront Configuration
 *
 * Central configuration for store settings, feature flags, and defaults.
 * Merchants can customize these values to match their business needs.
 */

export const storefrontConfig = {
  /**
   * Store Information
   */
  store: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Vendure Store',
    supportEmail: 'support@example.com',
    defaultCurrency: 'USD',
    defaultLocale: 'en-US',
  },

  /**
   * Feature Flags
   * Enable or disable optional storefront features
   */
  features: {
    wishlist: false,
    productReviews: false,
    productComparison: false,
    guestCheckout: true,
    subscriptions: false,
    multiCurrency: false,
  },

  /**
   * Search & Product Listing Settings
   */
  search: {
    productsPerPage: 12,
    defaultSort: 'newest' as const,
    showOutOfStock: true,
    enableFacetFilters: true,
  },

  /**
   * Cart & Checkout Settings
   */
  checkout: {
    showOrderNotes: true,
    requirePhoneNumber: false,
    showTaxBreakdown: true,
  },

  /**
   * Account Settings
   */
  account: {
    ordersPerPage: 10,
    addressLimit: 5,
  },
} as const;

export type StorefrontConfig = typeof storefrontConfig;
