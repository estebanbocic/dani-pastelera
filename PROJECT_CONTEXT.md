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

**Next Phase: Phase 1 — Infrastructure (Railway)**

## Phases Overview

| Phase | Name | Status |
|-------|------|--------|
| 0 | Project Setup | COMPLETED |
| 1 | Infrastructure (Railway) | Not Started |
| 2 | Catalog Foundation | Not Started |
| 3 | Product Configurator | Not Started |
| 4 | Pricing Engine | Not Started |
| 5 | Checkout & Mercado Pago | Not Started |
| 6 | Admin Operations | Not Started |
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

## Recent Changes

- **2026-05-01:** Phase 0 completed. Monorepo scaffolded with Medusa v2.14.2 backend, Astro 6.2 storefront, and 3 shared packages. All builds pass.
- **2026-05-01:** Project initialized. Repo created, foundational files added, scope docs committed.

---

*Last updated: 2026-05-01*
