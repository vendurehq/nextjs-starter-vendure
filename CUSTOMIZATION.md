# Customization Guide

This guide explains how to customize the Vendure Next.js Starter without modifying core files, enabling easy upstream updates.

## Architecture Overview

The codebase follows a layered architecture separating Vendure-maintained code from merchant customizations:

```
/src/
├── core/                 # VENDURE-MAINTAINED (do not modify)
│   ├── components/       # ProductCard, Navbar, Footer, etc.
│   ├── lib/vendure/      # GraphQL API, queries, mutations
│   ├── hooks/            # Reusable hooks
│   ├── contexts/         # React contexts
│   └── theme/            # Core design tokens
│
├── merchant/             # YOUR CUSTOMIZATIONS
│   ├── components/       # Component overrides and custom components
│   ├── theme/            # Design token and style overrides
│   └── lib/graphql/      # Custom queries and fragments
│
├── config/               # CONFIGURATION
│   ├── storefront.config.ts    # Store settings, feature flags
│   ├── theme.config.ts         # Logo, layout, branding
│   └── components.*.registry.ts # Component override registry
│
└── app/                  # NEXT.JS ROUTES (merchant-owned)
```

**Path Aliases:**
- `@core/*` → `src/core/*`
- `@merchant/*` → `src/merchant/*`
- `@config/*` → `src/config/*`

---

## Theme Customization

### Design Token Overrides

Override core design tokens in `src/merchant/theme/tokens.css`:

```css
/* src/merchant/theme/tokens.css */

/* Override primary color to green */
:root {
  --primary: oklch(0.65 0.2 145);
  --primary-foreground: oklch(0.98 0.01 145);
}

.dark {
  --primary: oklch(0.75 0.18 145);
  --primary-foreground: oklch(0.15 0.02 145);
}

/* Custom spacing or sizing */
:root {
  --radius: 0.5rem; /* Smaller border radius */
}
```

**Available tokens** (defined in `src/core/theme/base.css`):
- Colors: `--primary`, `--secondary`, `--background`, `--foreground`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
- Chart colors: `--chart-1` through `--chart-5`
- Sidebar: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-accent`, etc.
- Radius: `--radius`

### Component Style Overrides

Override component styles using data attributes in `src/merchant/theme/components.css`:

```css
/* src/merchant/theme/components.css */

/* Remove border radius from product cards */
[data-component="product-card"] {
  border-radius: 0;
}

/* Custom button styles */
[data-component="add-to-cart"] {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Hero section customization */
[data-component="hero-section"] {
  min-height: 70vh;
}
```

### Theme Configuration

Customize branding and layout in `src/config/theme.config.ts`:

```typescript
export const themeConfig = {
  brand: {
    logo: '/your-logo.svg',
    logoAlt: 'Your Store',
    logoDark: '/your-logo-dark.svg',
    favicon: '/favicon.ico',
  },
  layout: {
    maxWidth: '1400px',        // Wider content area
    navbarPosition: 'sticky',   // 'sticky' | 'fixed' | 'static'
    footerStyle: 'full',        // 'full' | 'minimal'
  },
  hero: {
    showHero: true,
    height: 'large',            // 'small' | 'medium' | 'large'
    overlay: true,
  },
  products: {
    cardStyle: 'default',
    showQuickView: false,
    imageAspectRatio: '1:1',    // '1:1' | '4:3' | '3:4'
  },
  social: {
    twitter: 'https://twitter.com/yourstore',
    instagram: 'https://instagram.com/yourstore',
    // Add other social links as needed
  },
};
```

---

## Component Overrides

### How Component Overrides Work

Components are loaded through registries that allow swapping implementations:

- **Server Components:** `src/config/components.server.registry.ts`
- **Client Components:** `src/config/components.client.registry.ts`

### Creating a Component Override

**Step 1:** Copy the core component to merchant overrides:

```bash
# Create the overrides directory if needed
mkdir -p src/merchant/components/overrides

# Copy the component you want to override
cp src/core/components/commerce/product-card.tsx \
   src/merchant/components/overrides/ProductCard.tsx
```

**Step 2:** Customize your component:

```tsx
// src/merchant/components/overrides/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { readFragment } from '@/graphql';
import { ProductCardFragment } from '@core/lib/vendure/fragments';
import { ClientComponents } from '@config/components.client.registry';
import type { ProductCardProps } from '@core/components/commerce/product-card';

export function ProductCard({ product: productProp }: ProductCardProps) {
  const product = readFragment(ProductCardFragment, productProp);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-card rounded-xl overflow-hidden border-2 border-border hover:border-primary"
      data-component="product-card"
    >
      {/* Your customized component implementation */}
      <div className="aspect-square relative">
        {/* Custom badge */}
        <span className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
          NEW
        </span>
        {product.productAsset && (
          <Image
            src={product.productAsset.preview}
            alt={product.productName}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{product.productName}</h3>
        {/* Use ClientComponents for nested components */}
        <ClientComponents.Price value={product.priceWithTax} />
      </div>
    </Link>
  );
}
```

**Step 3:** Update the registry to use your override:

```typescript
// src/config/components.client.registry.ts

// Comment out core import
// import { ProductCard } from '@core/components/commerce/product-card';

// Enable merchant override
import { ProductCard } from '@merchant/components/overrides/ProductCard';
```

### Available Components

**Server Components** (in `components.server.registry.ts`):
| Component | Description |
|-----------|-------------|
| `Navbar` | Main navigation bar |
| `Footer` | Site footer |
| `HeroSection` | Homepage hero banner |
| `FeaturedProducts` | Featured products section |
| `RelatedProducts` | Related products on PDP |
| `ProductGrid` | Product listing grid |
| `ProductGridSkeleton` | Loading skeleton for grid |

**Client Components** (in `components.client.registry.ts`):
| Component | Description |
|-----------|-------------|
| `ProductCard` | Individual product card |
| `Price` | Price display with currency |
| `OrderStatusBadge` | Order status indicator |
| `CountrySelect` | Country dropdown |
| `ProductInfo` | Product details on PDP |
| `ProductImageCarousel` | Image gallery |
| `ProductCarousel` | Horizontal product scroll |
| `SearchInput` | Search box |
| `FacetFilters` | Filter sidebar |
| `Pagination` | Page navigation |

### Using Components from Registry

When building custom components, use the registry to access components:

```tsx
// In a server component
import { ServerComponents } from '@config/components.server.registry';

export function CustomPage() {
  return (
    <div>
      <ServerComponents.Navbar />
      {/* Your content */}
      <ServerComponents.Footer />
    </div>
  );
}

// In a client component
'use client';
import { ClientComponents } from '@config/components.client.registry';

export function CustomPriceDisplay({ value }) {
  return (
    <div className="custom-price">
      <ClientComponents.Price value={value} />
    </div>
  );
}
```

---

## GraphQL Extensions

### Adding Custom Queries

Create custom GraphQL queries in `src/merchant/lib/graphql/`:

```typescript
// src/merchant/lib/graphql/queries.ts
import { graphql } from '@/graphql';

// Custom query with additional fields
export const CustomProductQuery = graphql(`
  query CustomProduct($slug: String!) {
    product(slug: $slug) {
      id
      name
      description
      customFields {
        myCustomField
      }
      assets {
        id
        preview
      }
    }
  }
`);
```

### Extending Fragments

If you need additional fields from existing queries, extend the fragments:

```typescript
// src/merchant/lib/graphql/fragments.ts
import { graphql } from '@/graphql';

export const ExtendedProductCardFragment = graphql(`
  fragment ExtendedProductCard on SearchResult {
    productId
    productName
    slug
    productAsset {
      preview
    }
    priceWithTax {
      ... on PriceRange {
        min
        max
      }
      ... on SinglePrice {
        value
      }
    }
    # Add your custom fields
    customFields {
      badge
      priority
    }
  }
`);
```

### Using Custom Queries

```typescript
import { vendureApi } from '@core/lib/vendure/api';
import { CustomProductQuery } from '@merchant/lib/graphql/queries';

export async function getCustomProduct(slug: string) {
  return vendureApi(CustomProductQuery, { slug });
}
```

---

## Storefront Configuration

Customize store settings in `src/config/storefront.config.ts`:

```typescript
export const storefrontConfig = {
  store: {
    name: 'My Awesome Store',
    supportEmail: 'help@mystore.com',
    defaultCurrency: 'EUR',
    defaultLocale: 'de-DE',
  },
  features: {
    wishlist: true,           // Enable wishlist
    productReviews: true,     // Enable reviews
    productComparison: false,
    guestCheckout: true,
    subscriptions: false,
    multiCurrency: false,
  },
  search: {
    productsPerPage: 24,      // Products per page
    defaultSort: 'price-asc', // Default sort order
    showOutOfStock: false,    // Hide out-of-stock items
    enableFacetFilters: true,
  },
  checkout: {
    showOrderNotes: true,
    requirePhoneNumber: true,
    showTaxBreakdown: true,
  },
  account: {
    ordersPerPage: 20,
    addressLimit: 10,
  },
};
```

---

## Creating Custom Components

For entirely new components (not overrides), place them in `src/merchant/components/custom/`:

```tsx
// src/merchant/components/custom/PromoBanner.tsx
'use client';

export function PromoBanner() {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-center">
      <p className="text-sm font-medium">
        Free shipping on orders over $50!
      </p>
    </div>
  );
}
```

Then use in your routes:

```tsx
// src/app/layout.tsx
import { PromoBanner } from '@merchant/components/custom/PromoBanner';
import { ServerComponents } from '@config/components.server.registry';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PromoBanner />
        <ServerComponents.Navbar />
        {children}
        <ServerComponents.Footer />
      </body>
    </html>
  );
}
```

---

## Best Practices

1. **Never modify files in `src/core/`** - Always use overrides or extensions.

2. **Keep overrides minimal** - Only copy what you need to change. Use composition with core components when possible.

3. **Use data attributes** - Add `data-component="..."` attributes for CSS targeting.

4. **Test theme switching** - Verify customizations work in both light and dark modes.

5. **Document your changes** - Keep notes on what you've customized for team members and future updates.

6. **Use TypeScript** - Leverage the exported Props types for type safety:
   ```typescript
   import type { ProductCardProps } from '@config/components.registry';
   ```

7. **Follow the import pattern** - Use `@core/`, `@merchant/`, and `@config/` aliases consistently.
