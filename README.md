# 🧁 Dani Pastelera

Boutique ecommerce platform for an artisanal bakery specializing in healthy, inclusive, and customizable pastry products.

## About

Dani Pastelera is a headless ecommerce built for a Chilean bakery offering:

- **Gluten-free** pastry for celiac customers
- **Sugar-free** pastry for diabetic customers
- **Vegan** pastry products
- Traditional pastry (secondary line)

The platform focuses on a rich **product configuration experience** — customers can customize cakes with dietary profiles, fillings, coverage, decorations, and personalized messages, all with real-time pricing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Medusa.js v2 |
| Storefront | Astro + React islands |
| Language | TypeScript |
| Database | PostgreSQL |
| Cache/Jobs | Redis |
| Hosting | Railway |
| Media | Cloudflare R2 |
| Payments | Mercado Pago |

## Project Structure

```
dani-pastelera/
├── apps/
│   ├── storefront/           # Astro + React frontend
│   └── backend/              # Medusa.js v2 backend
├── packages/
│   ├── shared-types/         # Shared TypeScript types
│   ├── pricing-engine/       # Price calculation logic
│   └── product-configurator/ # Configuration schema & validation
├── docs/                     # Scope & architecture docs
├── PROJECT_CONTEXT.md        # Living project state document
├── AGENTS.md                 # AI agent rules
└── README.md
```

## Getting Started

> 🚧 Project is in early setup phase. Instructions will be updated as the monorepo is initialized.

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL (local or Docker)
- Redis (local or Docker)

## Documentation

Full project scope and architecture documentation is in the `docs/` folder:

- [Project Overview](docs/00-project-overview.md)
- [Technical Architecture](docs/01-technical-architecture.md)
- [Infrastructure](docs/02-infrastructure-railway.md)
- [Product Model](docs/03-product-model.md)
- [Product Configurator](docs/04-product-configurator.md)
- [Pricing Engine](docs/05-pricing-engine.md)
- [Storefront UX/UI](docs/06-storefront-ux-ui.md)
- [Checkout & Payments](docs/07-checkout-and-payments.md)
- [Admin & Operations](docs/08-admin-and-operations.md)
- [Roadmap](docs/09-roadmap-and-milestones.md)

## Languages

- **Spanish** (default) — All customer-facing content
- **English** (secondary) — Full bilingual support
- **Codebase** — English only

## License

Private project.
