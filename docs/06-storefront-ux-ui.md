# Dani Pastelera — Storefront UX/UI

## 1. UX/UI Goal

The storefront must feel warm, trustworthy, clean, and easy to use.

The main visual focus must be product photography.

The design should communicate:

- Homemade quality.
- Healthy pastry.
- Care and trust.
- Inclusive dietary options.
- Premium but accessible experience.
- Simple buying journey.

---

## 2. Design Direction

Recommended visual style:

- Warm.
- Soft.
- Homemade.
- Clean.
- Light.
- Elegant.
- Mobile-first.
- Product-photo driven.

Suggested color direction:

- Warm cream.
- Soft vanilla.
- Light cacao.
- Pastel pink.
- Sage green.
- Warm white.
- Soft brown.

Avoid:

- Cold corporate design.
- Overly dark layouts.
- Too many visual effects.
- Busy sections.
- Aggressive ecommerce patterns.
- Generic template feeling.

---

## 3. Page Structure

Required pages:

```txt
/
 /productos
 /productos/[slug]
 /categorias/[slug]
 /carrito
 /checkout
 /orden-confirmada
 /nosotros
 /contacto
 /preguntas-frecuentes
 /politicas/despacho-y-retiro
 /politicas/alergenos
```

English routes:

```txt
/en
/en/products
/en/products/[slug]
/en/categories/[slug]
/en/cart
/en/checkout
/en/order-confirmed
/en/about
/en/contact
/en/faq
```

---

## 4. Home Page

Recommended sections:

1. Hero with strong product photo.
2. Main value proposition.
3. Dietary category cards.
4. Featured products.
5. How ordering works.
6. Trust section about ingredients and care.
7. Testimonials.
8. Instagram/gallery section.
9. Final CTA.

Spanish hero copy example:

```txt
Pastelería saludable, hecha con cariño.
```

Secondary copy:

```txt
Tortas y dulces sin gluten, sin azúcar y veganos, preparados a pedido para que todos puedan disfrutar.
```

---

## 5. Product Listing Page

Must include:

- Product cards.
- Category filters.
- Dietary filters.
- Search or simple filter input.
- Product badges.
- Price from.
- Clear product images.
- Mobile-friendly grid.

Product card should show:

- Image.
- Product name.
- Short description.
- Dietary badges.
- Price from.
- CTA.

Example CTA:

```txt
Ver producto
```

English:

```txt
View product
```

---

## 6. Product Detail Page

Must include:

- Large product image gallery.
- Product name.
- Dietary badges.
- Short description.
- Allergen information.
- Product configurator.
- Price breakdown.
- Delivery/preparation note.
- Add to cart button.
- Trust note.

Important: The product configurator must not feel hidden. It should be the main action area.

---

## 7. Cart UX

The cart must clearly show:

- Product image.
- Product name.
- Selected variant.
- Selected options.
- Personalized message.
- Delivery date.
- Price breakdown summary.
- Quantity.
- Remove/edit actions.
- Checkout CTA.

For configurable products, provide an edit option if feasible.

---

## 8. Checkout UX

Checkout must be short and simple.

Steps:

```txt
1. Customer information
2. Delivery or pickup
3. Date and time
4. Payment
5. Confirmation
```

Required customer fields:

- Name.
- Email.
- Phone / WhatsApp.
- Address if delivery.
- Commune / city.
- Notes.

Avoid asking for unnecessary account creation in the MVP.

---

## 9. Mobile UX Rules

Mobile is the priority.

Rules:

- Large buttons.
- Clear spacing.
- Avoid tiny text.
- Avoid dense forms.
- Use sticky price/add-to-cart when configuring product.
- Minimize checkout steps.
- Use clear progress indicators.
- Use high-quality optimized images.
- Make language switch easy but not intrusive.

---

## 10. Accessibility

Minimum accessibility expectations:

- Good color contrast.
- Keyboard-friendly controls.
- Proper labels for form inputs.
- Alt text for product images.
- Clear error messages.
- Buttons with descriptive labels.
- Avoid relying only on color to communicate dietary information.

---

## 11. Internationalization UX

The site must support Spanish and English.

Rules:

- Spanish default.
- English optional route.
- Language switcher in header and footer.
- Customer-facing copy must come from i18n/copy files.
- SEO metadata must be localized.
- If English product content is missing, fallback to Spanish.

---

## 12. AI Agent Instructions

When building the storefront:

- Use Astro for pages and layout.
- Use React only for interactive components.
- Prioritize performance.
- Prioritize mobile.
- Keep components clean and reusable.
- Keep all customer-facing text translatable.
- Do not hardcode long copy inside components.
- Make product photos the visual hero.
