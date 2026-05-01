# Dani Pastelera — Roadmap and Milestones

## 1. Roadmap Strategy

The project should be developed in phases.

The goal is to launch a real MVP as soon as possible, but with a clean foundation for future growth.

Avoid building advanced features before the core flow works:

```txt
Product → Configuration → Cart → Checkout → Payment → Order
```

---

## 2. Phase 0 — Project Setup

Deliverables:

- Monorepo created.
- Medusa backend initialized.
- Astro storefront initialized.
- TypeScript configured.
- Shared packages created.
- GitHub repository created.
- Basic README.
- Basic docs folder.

Success criteria:

- Project runs locally.
- Backend and storefront start without errors.
- Initial folder structure is clean.

---

## 3. Phase 1 — Infrastructure

Deliverables:

- Railway project created.
- PostgreSQL provisioned.
- Redis provisioned.
- Medusa backend deployed.
- Astro storefront deployed.
- Environment variables configured.
- Basic healthcheck tested.

Success criteria:

- Storefront can call backend.
- Backend connects to database.
- Worker connects to Redis.
- Deployment from GitHub works.

---

## 4. Phase 2 — Catalog Foundation

Deliverables:

- Categories.
- Product model.
- Product variants.
- Dietary tags.
- Allergen tags.
- Product image support.
- Basic product listing page.
- Basic product detail page.

Success criteria:

- Products can be created.
- Products can be viewed in storefront.
- Dietary tags are visible.
- Product photos display correctly.

---

## 5. Phase 3 — Product Configurator

Deliverables:

- Configuration schema.
- Configurator UI.
- Option cards.
- Compatibility rules.
- Required option validation.
- Add to cart with metadata.
- Price preview.

Success criteria:

- Customer can configure a product.
- Invalid combinations are blocked.
- Selected options are stored in cart.
- UI works well on mobile.

---

## 6. Phase 4 — Pricing Engine

Deliverables:

- Pricing engine package.
- Base price calculation.
- Option price deltas.
- Price breakdown.
- Backend validation.
- Unit tests.

Success criteria:

- Final price is calculated correctly.
- Frontend displays clear breakdown.
- Backend rejects invalid pricing.
- Tests cover main scenarios.

---

## 7. Phase 5 — Checkout and Mercado Pago

Deliverables:

- Cart page/drawer.
- Checkout form.
- Delivery/pickup fields.
- Mercado Pago preference creation.
- Payment redirect.
- Webhook endpoint.
- Order confirmation page.

Success criteria:

- Customer can complete a payment.
- Payment webhook updates order.
- Order is visible in admin.
- Order contains configuration metadata.
- Failed/cancelled payment scenarios are handled.

---

## 8. Phase 6 — Admin Operations

Deliverables:

- Admin order view improvements.
- Human-readable customization details.
- Order status workflow.
- Owner email notification.
- Customer email notification.
- Basic operational documentation.

Success criteria:

- Owner can understand and prepare orders.
- Customer receives confirmation.
- Order statuses can be updated.
- No raw JSON dependency for operations.

---

## 9. Phase 7 — UX/UI Polish

Deliverables:

- Warm visual identity.
- Responsive layout.
- Home page sections.
- Product photo optimization.
- Language switcher.
- SEO metadata.
- Accessibility improvements.

Success criteria:

- Site looks professional.
- Site works well on mobile.
- Spanish and English routes work.
- Product photos are prominent.
- Checkout feels simple.

---

## 10. Phase 8 — Launch Preparation

Deliverables:

- Production Mercado Pago credentials.
- Domain configuration.
- SSL.
- Test orders.
- Backup strategy.
- Error monitoring.
- Launch checklist.

Success criteria:

- Site is ready to sell.
- Owner can manage orders.
- Payment works in production.
- Critical flows tested on mobile.

---

## 11. Future Enhancements

Potential post-MVP features:

- WhatsApp notifications.
- Production calendar.
- Blocked dates.
- Delivery zones.
- Delivery pricing.
- Coupons.
- Gift cards.
- Bundles.
- Reorder previous order.
- Customer accounts.
- Instagram integration.
- Analytics dashboard.
- AI product recommendation assistant.

---

## 12. AI Agent Instructions

When following this roadmap:

- Do not skip product configuration modeling.
- Do not build payment before pricing validation is reliable.
- Do not polish UI before core flow works.
- Always test mobile.
- Always keep bilingual support in mind.
- Keep implementation incremental.
