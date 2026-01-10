/**
 * Theme Configuration
 *
 * Branding and layout settings for the storefront.
 * Merchants can customize these values to match their brand identity.
 */

export const themeConfig = {
  /**
   * Brand Assets
   */
  brand: {
    logo: '/logo.svg',
    logoAlt: 'Store Logo',
    logoDark: '/logo-dark.svg',
    favicon: '/favicon.ico',
  },

  /**
   * Layout Settings
   */
  layout: {
    maxWidth: '1280px',
    navbarPosition: 'sticky' as const,
    footerStyle: 'full' as const,
  },

  /**
   * Hero Section Defaults
   */
  hero: {
    showHero: true,
    height: 'medium' as const,
    overlay: true,
  },

  /**
   * Product Display Settings
   */
  products: {
    cardStyle: 'default' as const,
    showQuickView: false,
    imageAspectRatio: '1:1' as const,
  },

  /**
   * Social Links
   * Add your store's social media profiles
   */
  social: {
    twitter: '',
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
  },
} as const;

export type ThemeConfig = typeof themeConfig;
