<p align="center">
  <a href="https://vendure.io">
    <img alt="Vendure logo" height="60" width="auto" src="https://a.storyblok.com/f/328257/699x480/8dbb4c7a3c/logo-icon.png/m/0x80">
  </a>
</p>
<h1 align="center">
  Vendure Next.js Storefront Starter
</h1>
<h3 align="center">
    A Next.js 16 storefront starter for Vendure headless commerce
</h3>
<p align="center">
 Use as a foundation to build upon, take inspiration from, or learn the ergonomics of the Vendure Shop API.
</p>
<h4 align="center">
  <a href="https://next.vendure.io">Demo</a> |
  <a href="https://docs.vendure.io">Documentation</a> |
  <a href="https://vendure.io">Website</a>
</h4>

## Features

**Authentication & Accounts**
- Customer registration with email verification
- Login/logout with session management
- Password reset & change password
- Email address updates with verification

**Customer Account**
- Profile management (name, email, password)
- Address management (create, update, delete, set default)
- Order history with pagination & detailed order views

**Product Browsing**
- Collections & featured products
- Product detail pages with variants & galleries
- Full-text search with faceted filtering
- Pagination & sorting

**Shopping Cart**
- Add/remove items, adjust quantities
- Promotion code support
- Real-time cart updates with totals

**Checkout**
- Multi-step flow: shipping address, delivery method, payment, review
- Saved address selection
- Shipping method selection
- Payment integration

**Order Management**
- Order confirmation page
- Order tracking with status
- Detailed order information

**Internationalization**
- Multi-language support via next-intl (English & German out of the box)
- Multi-currency support with persistent currency selection
- Locale-aware price formatting

## Getting Started

Copy the example environment file, configure your Vendure Shop API, install dependencies, and start the development server:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

The App Router files under `src/app` are intentionally thin. Storefront behavior and presentation live in vertical modules under `src/features`, cross-cutting integrations under `src/platform`, and store-specific composition under `src/site`.

See the [architecture guide](./docs/architecture.md) before adding a capability.

## Upgrading a Customized Storefront

This starter is designed to remain fully source-owned after cloning or forking. Tagged releases include structured integration intent so a human or coding agent can reconcile upstream changes with local customizations.
See the [upgrade guide](./docs/upgrades.md) for initialization, managed upgrades, legacy onboarding, verification, and release authoring.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
