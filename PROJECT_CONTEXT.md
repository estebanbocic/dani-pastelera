# Dani Pastelera — Project Context

> **This is a living document.** It must be updated after every significant change to the project.
> Always read this file at the start of a new conversation to understand the current state.

## Project Summary

Dani Pastelera is a boutique headless ecommerce platform for an artisanal bakery specializing in healthy, inclusive, and customizable pastry products (gluten-free, sugar-free, vegan) with a secondary line of traditional pastry.

- **Domain:** danipastelera.cl
- **Repo:** https://github.com/estebanbocic/dani-pastelera
- **Catalog size:** ~50 products, highly configurable
- **Languages:** Spanish (default) + English
- **Currency:** CLP (Chilean Peso, integer amounts)

## Tech Stack

- **Backend:** Medusa.js v2
- **Storefront:** Astro + React islands (interactive components only)
- **Language:** TypeScript (entire codebase)
- **Database:** PostgreSQL
- **Cache/Jobs:** Redis
- **Hosting:** Railway
- **Media Storage:** Cloudflare R2
- **Payments:** Mercado Pago
- **Source Control:** GitHub

## Monorepo Structure

```
dani-pastelera/
├── apps/
│   ├── storefront/          # Astro + React
│   └── backend/             # Medusa.js v2
├── packages/
│   ├── shared-types/        # Shared TypeScript types
│   ├── pricing-engine/      # Price calculation logic
│   └── product-configurator/ # Configuration schema & validation
├── docs/                    # Scope & architecture docs
├── PROJECT_CONTEXT.md       # This file
├── AGENTS.md                # Warp AI rules
└── README.md
```

## Current Phase

**Phase 0 — Project Setup** (COMPLETED)

### Completed
- [x] GitHub repo created (estebanbocic/dani-pastelera, private)
- [x] Git initialized with main branch
- [x] PROJECT_CONTEXT.md created
- [x] AGENTS.md (Warp rules) created
- [x] Scope docs copied to docs/
- [x] README.md created
- [x] .gitignore created
- [x] pnpm monorepo initialized (pnpm-workspace.yaml, root package.json, tsconfig.base.json)
- [x] Medusa.js v2 backend scaffolded (apps/backend/) — v2.14.2
- [x] Astro storefront scaffolded (apps/storefront/) — Astro 6.2
- [x] shared-types package with domain types (LocalizedText, DietaryTag, AllergenTag, pricing, configurator types)
- [x] pricing-engine package scaffolded with placeholder functions
- [x] product-configurator package scaffolded with placeholder functions
- [x] i18n foundation: es.json and en.json translation files
- [x] .env.example for backend and storefront
- [x] All packages build successfully

**Phase 2 — Catalog Foundation** (COMPLETED)

### Phase 2 Completed
- [x] Cleaned Medusa demo seed data (4 sample products removed)
- [x] 9 product categories created: Sin Gluten, Sin Azúcar, Vegano, Tortas, Brownies, Galletas, Cupcakes, Cajas de Regalo, Tradicional
- [x] Publishable API key created and linked to sales channel
- [x] 4 sample products with variants and dietary/allergen metadata:
  - Torta Brownie Saludable (4 variants: 8/10/15/20 porciones)
  - Cheesecake Sin Azúcar (3 variants: 8/10/15 porciones)
  - Cupcakes Veganos (2 variants: caja de 6/12)
  - Galletas Sin Gluten Surtidas (3 variants: 6/12/24 unidades)
- [x] Medusa API client helper (`apps/storefront/src/lib/medusa.ts`)
- [x] Product listing page `/productos` with dietary badges, category pills, price from
- [x] Product detail page `/productos/[handle]` with variants, allergens, prep time
- [x] Seed script: `apps/backend/src/scripts/seed-catalog.ts`

**Phase 3 — Product Configurator + Pricing Engine** (COMPLETED)

### Phase 3 Completed
- [x] React + Tailwind v4 integrated into Astro storefront
- [x] Customization schemas seeded on Torta Brownie (5 steps) and Cheesecake (3 steps)
- [x] product-configurator package: real validation and compatibility rules
- [x] pricing-engine package: real price calculation (base + option deltas)
- [x] React components: ProductConfigurator, OptionCard, PriceBreakdown
- [x] Step-by-step configurator with live price breakdown, variant selector, date picker, message input
- [x] Configurator renders as React island on product detail pages with schemas
- [x] Seed script: `apps/backend/src/scripts/seed-configurator.ts`

**Phase 5 — Homepage, Cart, Checkout & Mercado Pago** (COMPLETED)

### Phase 5 Completed
- [x] Homepage: hero, dietary category cards, featured products, how it works, trust section, CTA, footer
- [x] Cart: React context + localStorage cart ID, CartDrawer slide-out, Medusa Cart API integration
- [x] Configurator wired to cart: adds to Medusa cart with full configuration metadata
- [x] Checkout page: customer info, delivery/pickup, date, order summary, MP payment button
- [x] Mercado Pago payment provider module (dev mode when no credentials)
- [x] Webhook endpoint: POST /store/webhooks/mercado-pago (idempotent)
- [x] Order confirmation page: /orden-confirmada with order details
- [x] Chile (CLP) region created, EUR region removed

**Phase 6 — Admin Operations** (COMPLETED)

### Phase 6 Completed
- [x] Email notifications: customer order confirmation + owner alert via Resend (`src/lib/email.ts`, `src/templates/`)
- [x] Order status workflow: custom statuses in `order.metadata.custom_status`, admin widget (`order-status.tsx`) with one-click status advancement
- [x] Admin status API endpoint: `PUT /admin/orders/:id/status`
- [x] MP webhook completed: captures payment and updates `custom_status` on approved/rejected
- [x] Operational documentation: `docs/OPERATIONS.md`

**Next Phase: Phase 7 — UX/UI Polish**

## Local Development

### Prerequisites (installed)
- PostgreSQL 16 (apt, service: `sudo service postgresql start`)
- Redis 7 (apt, service: `sudo service redis-server start`)
- Node.js 22, pnpm 9

### Start Services
```
sudo service postgresql start
sudo service redis-server start
pnpm --filter @dani-pastelera/backend dev     # port 9000
pnpm --filter @dani-pastelera/storefront dev   # port 4321
```

### Admin Dashboard
- URL: http://localhost:9000/app
- Email: admin@danipastelera.cl
- Password: Admin123!

### Database
- Name: dani_pastelera
- URL: postgres://postgres:postgres@127.0.0.1:5432/dani_pastelera

## Phases Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Setup | COMPLETED |
| 1 | Infrastructure (Railway) | Not Started |
| 2 | Catalog Foundation | COMPLETED |
| 3 | Product Configurator | COMPLETED |
| 4 | Pricing Engine | COMPLETED (merged into Phase 3) |
| 5 | Checkout & Mercado Pago | COMPLETED |
| 6 | Admin Operations | COMPLETED |
| 7 | UX/UI Polish | Not Started |
| 8 | Launch Preparation | Not Started |

## Key Architecture Decisions

1. **No SKU explosion** — Variants only for size/portions/format. Custom metadata for dietary, filling, coverage, decoration, message, delivery.
2. **Server-side pricing** — Frontend shows estimates, backend is source of truth.
3. **Bilingual from day 1** — i18n structure, no hardcoded copy in components. Spanish fallback.
4. **Astro for static, React for interactive** — Configurator, cart, checkout, price breakdown use React islands.
5. **Mercado Pago webhooks must be idempotent.**

## Important Files

- `docs/` — Full scope and architecture documentation (12 files)
- `PROJECT_CONTEXT.md` — This file (current state)
- `AGENTS.md` — Warp AI rules for this project
- `apps/backend/` — Medusa.js v2 backend (port 9000)
- `apps/storefront/` — Astro storefront (port 4321)
- `packages/shared-types/` — Domain types used across all packages
- `packages/pricing-engine/` — Price calculation logic
- `packages/product-configurator/` — Configuration schema & validation
- `apps/storefront/src/i18n/` — Translation files (es.json, en.json)
- `apps/storefront/src/lib/medusa.ts` — Medusa API client + dietary/allergen label helpers
- `apps/storefront/src/pages/productos/` — Product listing and detail pages
- `apps/backend/src/scripts/seed-catalog.ts` — Catalog seed script
- `apps/backend/src/scripts/seed-configurator.ts` — Configurator schema seed
- `apps/storefront/src/components/configurator/` — React configurator components
- `apps/storefront/src/styles/global.css` — Tailwind v4 with bakery design tokens
- `apps/storefront/src/lib/cart.ts` — Medusa Cart API client
- `apps/storefront/src/components/cart/` — CartProvider, CartDrawer, CartIsland
- `apps/storefront/src/components/CheckoutIsland.tsx` — Checkout form
- `apps/storefront/src/components/OrderConfirmation.tsx` — Order confirmation
- `apps/backend/src/modules/mercado-pago/` — Mercado Pago payment provider
- `apps/backend/src/api/store/webhooks/mercado-pago/` — IPN webhook (captures payment on approval)
- `apps/backend/src/lib/email.ts` — Resend email service (customer + owner notifications)
- `apps/backend/src/templates/` — HTML email templates (order-confirmation, order-notification)
- `apps/backend/src/api/admin/orders/[id]/status/` — Custom order status update endpoint
- `apps/backend/src/admin/widgets/order-status.tsx` — Admin widget: status badge + one-click advancement
- `docs/OPERATIONS.md` — Owner-facing operations guide

## Recent Changes

- **2026-05-02:** Phase 6 completed. Email notifications (Resend), order status workflow + admin widget, MP webhook payment capture, OPERATIONS.md.
- **2026-05-02:** Phase 5 completed. Homepage, cart, checkout, Mercado Pago provider, webhook, order confirmation.
- **2026-05-01:** Phase 3 completed.

- **2026-05-01:** Phase 2 completed. 9 categories, 4 products with variants/dietary metadata. Product listing and detail pages on storefront. Publishable API key configured.
- **2026-05-01:** Local dev environment running.
- **2026-05-01:** Phase 0 completed. Monorepo scaffolded with Medusa v2.14.2 backend, Astro 6.2 storefront, and 3 shared packages. All builds pass.
- **2026-05-01:** Project initialized. Repo created, foundational files added, scope docs committed.

---

*Last updated: 2026-05-02*
