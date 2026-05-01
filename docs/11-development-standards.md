# Dani Pastelera — Development Standards

## 1. General Standards

The codebase must be:

- Clean.
- Typed.
- Modular.
- Maintainable.
- Easy to understand.
- Production-oriented.
- Friendly to AI-assisted development.

Use TypeScript across frontend, backend, and shared packages.

---

## 2. Language Standards

Code language:

- English.

Customer-facing language:

- Spanish and English.

Rules:

- Component names in English.
- Function names in English.
- Variables in English.
- Database fields in English.
- API routes in English.
- User-facing copy in i18n files.
- Spanish is default customer-facing language.
- English is secondary customer-facing language.

---

## 3. Naming Conventions

Use clear names.

Good examples:

```ts
calculateProductPrice()
validateSelectedOptions()
buildPriceBreakdown()
ProductConfigurator
DeliveryDatePicker
DietaryBadge
```

Avoid vague names:

```ts
handleStuff()
processData()
doThing()
magicPrice()
```

---

## 4. Folder Structure

Recommended storefront structure:

```txt
apps/storefront/src/
├── components/
├── layouts/
├── pages/
├── i18n/
├── lib/
├── styles/
├── types/
└── utils/
```

Recommended backend structure:

```txt
apps/backend/src/
├── modules/
├── workflows/
├── api/
├── services/
├── subscribers/
├── jobs/
├── integrations/
└── utils/
```

Recommended packages:

```txt
packages/
├── shared-types/
├── pricing-engine/
└── product-configurator/
```

---

## 5. TypeScript Rules

Rules:

- Avoid `any` unless absolutely necessary.
- Define explicit types for domain models.
- Share types when used across backend and frontend.
- Keep DTOs separate from internal models when needed.
- Validate external input using a schema library if appropriate.

Recommended validation library:

```txt
zod
```

---

## 6. Frontend Standards

Use Astro for:

- Pages.
- Layouts.
- Static content.
- SEO.
- Routing.

Use React for:

- Product configurator.
- Cart drawer.
- Checkout forms.
- Interactive selectors.
- Price breakdown.
- Delivery date picker.

Rules:

- Keep components small.
- Keep business rules outside components.
- Keep copy in i18n files.
- Optimize images.
- Prioritize mobile.
- Use semantic HTML.
- Keep accessibility in mind.

---

## 7. Backend Standards

Rules:

- Keep business logic in services/modules.
- Keep API handlers thin.
- Validate incoming data.
- Never trust frontend pricing.
- Keep payment logic isolated.
- Keep webhook logic idempotent.
- Log important order/payment events.
- Avoid mixing product configuration logic with payment logic.

---

## 8. Testing Standards

Minimum tests:

- Pricing engine unit tests.
- Product configuration validation tests.
- Compatibility rule tests.
- Checkout validation tests.
- Mercado Pago webhook idempotency tests.

Recommended test cases:

```txt
Valid product configuration calculates correct price.
Invalid option is rejected.
Incompatible options are rejected.
Missing required option is rejected.
Backend ignores frontend total.
Duplicate payment webhook does not duplicate order changes.
```

---

## 9. Error Handling

Customer-facing errors must be friendly.

Spanish example:

```txt
No pudimos agregar este producto al carrito. Por favor revisa las opciones seleccionadas.
```

English example:

```txt
We could not add this product to the cart. Please review your selected options.
```

Internal errors should be logged with enough context but must not expose secrets.

---

## 10. Security Standards

Rules:

- Store secrets in environment variables.
- Never expose Mercado Pago access token.
- Use HTTPS.
- Validate webhooks.
- Sanitize user inputs.
- Validate text fields.
- Avoid trusting client-side data.
- Apply rate limiting later if needed.
- Keep admin access protected.

---

## 11. Documentation Standards

Every important module should include:

- Purpose.
- Inputs.
- Outputs.
- Main functions.
- Validation rules.
- Example usage.
- Edge cases.

Keep docs short but useful.

---

## 12. AI Agent Instructions

When generating or modifying code:

- Follow this document.
- Use English for code.
- Keep user-facing content translatable.
- Prefer simple architecture.
- Add comments only when they clarify intent.
- Do not overengineer.
- Keep the ecommerce flow reliable.
