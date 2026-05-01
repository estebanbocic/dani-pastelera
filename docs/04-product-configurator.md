# Dani Pastelera — Product Configurator

## 1. Purpose

The product configurator is the most important user experience in the ecommerce.

It must allow customers to configure pastry products in a simple, clear, and mobile-friendly way.

The configurator must support options that affect:

- Product price.
- Product availability.
- Ingredient compatibility.
- Dietary profile.
- Preparation time.
- Final order details.

---

## 2. UX Principle

The configurator should feel like a guided step-by-step flow, not a complex form.

Recommended experience:

```txt
Step 1: Choose size
Step 2: Choose dietary profile
Step 3: Choose filling
Step 4: Choose coverage
Step 5: Choose decoration
Step 6: Add personalized message
Step 7: Choose delivery date
Step 8: Review and add to cart
```

The customer must always understand:

- What they are choosing.
- Whether the option has an extra cost.
- Whether the option is compatible.
- What the final price is.
- What will be added to the cart.

---

## 3. Mobile-First Behavior

On mobile:

- Product photo should appear first.
- Configurator should be displayed as clear steps.
- Buttons must be large and easy to tap.
- Price should be sticky or always visible.
- Add to cart button should be highly visible.
- Avoid dense forms.
- Avoid too many options on one screen.

Recommended mobile layout:

```txt
Product Image
Product Name
Dietary Badges
Current Step
Selectable Options
Price Summary
Sticky Add to Cart / Continue Button
```

---

## 4. Configuration Step Model

Recommended type:

```ts
type CustomizationStep = {
  id: string
  label: LocalizedText
  description?: LocalizedText
  type: "single_select" | "multi_select" | "boolean" | "text" | "date"
  required: boolean
  options?: CustomizationOption[]
  validation?: CustomizationValidation
}
```

---

## 5. Configuration Option Model

```ts
type CustomizationOption = {
  id: string
  label: LocalizedText
  description?: LocalizedText
  priceDelta?: number
  isDefault?: boolean
  dietaryTags?: DietaryTag[]
  allergenTags?: AllergenTag[]
  incompatibleWith?: string[]
  requires?: string[]
  isActive: boolean
}
```

Example:

```json
{
  "id": "filling_frambuesa",
  "label": {
    "es": "Frambuesa",
    "en": "Raspberry"
  },
  "priceDelta": 2000,
  "isActive": true
}
```

---

## 6. Compatibility Rules

Some options cannot be selected together.

Examples:

- If the customer selects vegan preparation, dairy-based fillings must be disabled.
- If the customer selects sugar-free preparation, sugar-based decorations must be disabled.
- If the customer selects gluten-free, ingredients containing wheat must be disabled.

Recommended rule model:

```ts
type CompatibilityRule = {
  id: string
  condition: {
    selectedOptionId: string
  }
  effect: {
    disableOptionIds?: string[]
    requireOptionIds?: string[]
    showWarning?: LocalizedText
  }
}
```

---

## 7. Price Visibility

Every paid option must show the extra cost.

Example labels:

```txt
Frambuesa +$2.000
Chocolate 70% +$1.500
Mensaje personalizado +$1.000
```

The customer must also see a price breakdown:

```txt
Base torta 15 personas: $32.990
Relleno frambuesa: +$2.000
Versión vegana: +$3.500
Mensaje personalizado: +$1.000
Total: $39.490
```

---

## 8. Validation Rules

Before adding to cart, validate:

- Required options are selected.
- Selected options are active.
- Selected options are compatible.
- Selected delivery date is valid.
- Text fields do not exceed character limits.
- Quantity is allowed.
- Final price was calculated by backend.

Frontend validation improves UX, but backend validation is mandatory.

---

## 9. Add to Cart Payload

The storefront should send a structured configuration payload.

Example:

```json
{
  "productId": "prod_123",
  "variantId": "variant_123",
  "quantity": 1,
  "selectedOptions": {
    "dietaryProfile": ["gluten_free", "sugar_free"],
    "filling": "filling_frambuesa",
    "coverage": "coverage_chocolate_70",
    "decoration": "birthday_simple",
    "message": "Feliz cumpleaños Jose",
    "deliveryDate": "2026-05-10"
  }
}
```

The backend must validate the payload and calculate final price.

---

## 10. Required Components

Recommended React components:

```txt
ProductConfigurator.tsx
ConfiguratorStep.tsx
OptionCard.tsx
DietaryBadge.tsx
AllergenWarning.tsx
PriceBreakdown.tsx
DeliveryDatePicker.tsx
PersonalizedMessageInput.tsx
AddToCartButton.tsx
```

---

## 11. AI Agent Instructions

When implementing the configurator:

- Keep business rules outside visual components.
- Use TypeScript types for every configuration object.
- Avoid hardcoded Spanish/English labels in components.
- Use localized copy.
- Always validate on frontend and backend.
- Keep the UX simple even if the rules are complex.
- Make it feel easy for a non-technical customer.
