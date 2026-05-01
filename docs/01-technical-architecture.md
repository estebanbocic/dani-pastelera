# Dani Pastelera — Technical Architecture

## 1. Architecture Overview

Dani Pastelera should be built as a headless ecommerce application.

The recommended architecture is:

```txt
Customer
  ↓
Astro Storefront
  ↓
Medusa Backend API
  ↓
PostgreSQL
  ↓
Redis / Worker
  ↓
Mercado Pago
```

The system should prioritize simplicity for the MVP, while keeping a clean separation between storefront, commerce backend, pricing logic, product configuration logic, and payment integration.

---

## 2. Recommended Stack

Core stack:

- Medusa.js v2 for ecommerce backend.
- Astro for storefront.
- React islands for interactive storefront components.
- TypeScript across the codebase.
- PostgreSQL for persistent data.
- Redis for background jobs, caching, and Medusa event processing.
- Railway for infrastructure.
- Cloudflare R2 for product images and media assets.
- Mercado Pago for payments.
- GitHub for source control.

---

## 3. Monorepo Structure

Recommended repository structure:

```txt
dani-pastelera/
│
├── apps/
│   ├── storefront/
│   └── backend/
│
├── packages/
│   ├── shared-types/
│   ├── pricing-engine/
│   └── product-configurator/
│
├── docs/
│   ├── 00-project-overview.md
│   ├── 01-technical-architecture.md
│   ├── 02-infrastructure-railway.md
│   ├── 03-product-model.md
│   ├── 04-product-configurator.md
│   ├── 05-pricing-engine.md
│   ├── 06-storefront-ux-ui.md
│   ├── 07-checkout-and-payments.md
│   └── 08-admin-and-operations.md
│
└── README.md
```

---

## 4. Backend Responsibilities

The Medusa backend is responsible for:

- Products.
- Variants.
- Collections.
- Categories.
- Regions.
- Carts.
- Checkout.
- Customers.
- Orders.
- Payments.
- Admin.
- Store API.
- Custom modules.
- Payment webhooks.
- Order state transitions.

Custom business logic should be placed in explicit modules or services rather than scattered throughout the codebase.

---

## 5. Storefront Responsibilities

The Astro storefront is responsible for:

- Home page.
- Category pages.
- Product listing pages.
- Product detail pages.
- Product configurator UI.
- Cart drawer/page.
- Checkout flow.
- Order confirmation page.
- Language switcher.
- SEO metadata.
- Responsive layout.
- Product image presentation.

Astro should handle mostly static and content-driven pages.

React should be used only for interactive parts such as:

- Product configurator.
- Price breakdown.
- Add to cart.
- Cart drawer.
- Checkout form.
- Delivery date selector.
- Language switcher if needed.

---

## 6. Custom Packages

### pricing-engine

Responsible for calculating prices based on:

- Product.
- Variant.
- Size.
- Quantity.
- Dietary profile.
- Filling.
- Coverage.
- Decoration.
- Special extras.
- Packaging.
- Delivery configuration.

### product-configurator

Responsible for:

- Configuration schema.
- Option validation.
- Dependency rules.
- Incompatibility rules.
- UI-friendly configuration state.

### shared-types

Responsible for shared TypeScript types used by backend and frontend.

Example:

```ts
type LocalizedText = {
  es: string
  en: string
}

type PriceBreakdownItem = {
  label: LocalizedText
  amount: number
  type: "base" | "extra" | "discount"
}
```

---

## 7. Core Architectural Decision

Do not create one SKU for every possible combination.

Instead, use this approach:

```txt
Medusa Product
  ↓
Medusa Variant for major commercial choices
  ↓
Custom metadata for detailed configuration
  ↓
Pricing engine for dynamic pricing
  ↓
Line item metadata for order details
```

Recommended real variants:

- Product size.
- Number of portions.
- Base format.

Recommended metadata/custom options:

- Dietary profile.
- Filling.
- Coverage.
- Decoration.
- Personalized message.
- Special notes.
- Delivery date.
- Packaging.

---

## 8. Internationalization

The system must support Spanish and English from the beginning.

Rules:

- Spanish is default.
- English is secondary.
- Code is written in English.
- User-facing copy is translatable.
- Product content must support localized fields.
- Spanish is fallback.

Recommended route strategy:

```txt
/                         Spanish home
/productos                Spanish products
/productos/torta-brownie

/en                       English home
/en/products              English products
/en/products/healthy-brownie
```

For MVP, English slugs can temporarily reuse Spanish slugs if needed, but architecture should support localized slugs later.

---

## 9. Integration Boundaries

External integrations:

- Mercado Pago for payment.
- Cloudflare R2 for images/media.
- Optional email provider.
- Optional analytics provider.
- Optional WhatsApp notification provider later.

The first version should avoid unnecessary integrations.

---

## 10. Architecture Principles

Use the following principles:

- Keep the MVP simple but production-ready.
- Build strong domain models for product configuration.
- Keep pricing logic centralized.
- Keep user-facing copy centralized.
- Keep business rules out of UI components.
- Use TypeScript types across frontend and backend.
- Prefer explicit modules over hidden logic.
- Prioritize mobile UX.
- Prioritize reliability in payment and order confirmation.
