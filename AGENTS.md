# Dani Pastelera — Project Rules

## Rule 1: Always Read PROJECT\_CONTEXT.md First

At the start of every conversation about this project, read `PROJECT\_CONTEXT.md` before doing anything else. This file contains the current state of the project: what has been built, what phase we're in, key decisions, and recent changes.

Do NOT assume you know the project state without reading this file.

## Rule 2: Always Update PROJECT\_CONTEXT.md After Changes

After completing any significant work (new features, architectural changes, phase completion, new files/modules, dependency additions, configuration changes), update `PROJECT\_CONTEXT.md` to reflect the new state. This includes:

* Moving items from "Not Started" to "Completed" in the current phase.
* Updating the "Current Phase" section if a phase is completed.
* Adding entries to "Recent Changes" with the date.
* Updating "Important Files" if new key files are introduced.
* Updating the monorepo structure if it changes.
* Adding new architecture decisions if made.

## Rule 3: Codebase Language

* All code (variables, functions, components, database fields, API routes, comments) must be in **English**.
* All customer-facing text must use i18n/translation files. Never hardcode Spanish or English strings in components.
* Spanish is the default and fallback language. English is secondary.

## Rule 4: Architecture Principles

* **Medusa.js v2** for backend. **Astro** for storefront. **React** only for interactive components (configurator, cart, checkout, price breakdown).
* **No SKU explosion**: Variants for size/portions only. Use custom metadata for dietary, filling, coverage, decoration, etc.
* **Server-side pricing is truth**: Frontend shows previews, backend calculates and validates final price.
* **Mercado Pago webhooks must be idempotent.**
* Use **TypeScript** everywhere. Avoid `any`. Define explicit types for domain models.
* Use **zod** for runtime validation where appropriate.

## Rule 5: Development Standards

* Keep business logic in services/modules, not in UI components.
* Keep API handlers thin.
* Use integer amounts for CLP prices (no floating point).
* Write unit tests for pricing engine, configuration validation, and checkout.
* Follow the folder structure defined in `docs/01-technical-architecture.md`.
* Prefer explicit code over magic. Keep it simple.

## Rule 6: Scope Documents

Full project scope is in `docs/`. Reference these when implementing features:

* `docs/00-project-overview.md` — Business goals, catalog, MVP scope
* `docs/01-technical-architecture.md` — Stack, monorepo, architecture decisions
* `docs/02-infrastructure-railway.md` — Railway services, env vars, deployment
* `docs/03-product-model.md` — Products, variants, dietary/allergen tags, metadata
* `docs/04-product-configurator.md` — Step-by-step configurator UX and logic
* `docs/05-pricing-engine.md` — Dynamic pricing, breakdown, validation
* `docs/06-storefront-ux-ui.md` — Pages, design direction, mobile UX
* `docs/07-checkout-and-payments.md` — Checkout flow, Mercado Pago integration
* `docs/08-admin-and-operations.md` — Admin, order management, workflows
* `docs/09-roadmap-and-milestones.md` — Phases and deliverables
* `docs/10-ai-agent-master-prompt.md` — AI agent guidelines
* `docs/11-development-standards.md` — Coding standards, naming, testing

## Rule 7: Commit Messages

NEVER Include co-author attribution in every commit:

```
Co-Authored-By: Oz <oz-agent@warp.dev>
```

