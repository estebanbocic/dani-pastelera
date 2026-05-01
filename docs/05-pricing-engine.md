# Dani Pastelera — Pricing Engine

## 1. Purpose

The pricing engine calculates the final product price based on:

- Base product.
- Selected variant.
- Quantity.
- Dietary profile.
- Ingredients.
- Filling.
- Coverage.
- Decoration.
- Personalized message.
- Packaging.
- Delivery-related options.

This logic must be centralized and reusable across backend and possibly frontend preview logic.

---

## 2. Main Principle

The frontend can display estimated prices, but the backend must be the source of truth.

Final price must be calculated and validated server-side before:

- Adding to cart.
- Updating cart.
- Creating payment preference.
- Confirming the order.

---

## 3. Recommended Package

Create a shared package:

```txt
packages/pricing-engine
```

This package should expose pure TypeScript functions.

Recommended functions:

```ts
calculateProductPrice(input: CalculatePriceInput): PriceCalculationResult
validatePriceInput(input: CalculatePriceInput): ValidationResult
buildPriceBreakdown(input: CalculatePriceInput): PriceBreakdown
```

---

## 4. Input Model

```ts
type CalculatePriceInput = {
  productId: string
  variantId: string
  quantity: number
  selectedOptions: Record<string, string | string[] | boolean | number>
  currencyCode: "CLP"
}
```

---

## 5. Output Model

```ts
type PriceCalculationResult = {
  currencyCode: "CLP"
  baseAmount: number
  extrasAmount: number
  discountAmount: number
  totalAmount: number
  breakdown: PriceBreakdownItem[]
  warnings?: LocalizedText[]
}
```

```ts
type PriceBreakdownItem = {
  id: string
  label: LocalizedText
  type: "base" | "extra" | "discount"
  amount: number
}
```

---

## 6. Example Price Breakdown

```txt
Base torta 15 personas: $32.990
Relleno frambuesa: +$2.000
Versión vegana: +$3.500
Mensaje personalizado: +$1.000

Total: $39.490
```

JSON example:

```json
{
  "currencyCode": "CLP",
  "baseAmount": 32990,
  "extrasAmount": 6500,
  "discountAmount": 0,
  "totalAmount": 39490,
  "breakdown": [
    {
      "id": "base",
      "label": {
        "es": "Base torta 15 personas",
        "en": "Base cake 15 portions"
      },
      "type": "base",
      "amount": 32990
    },
    {
      "id": "filling_frambuesa",
      "label": {
        "es": "Relleno frambuesa",
        "en": "Raspberry filling"
      },
      "type": "extra",
      "amount": 2000
    }
  ]
}
```

---

## 7. Currency Rules

The initial currency is Chilean Peso.

Rules:

- Currency code: CLP.
- No decimal places in display.
- Format prices using Chilean locale.
- Store amounts as integers.
- Avoid floating-point calculations.

Recommended formatting:

```ts
new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
})
```

---

## 8. Pricing Sources

Price may come from:

- Medusa variant base price.
- Custom option price deltas.
- Product-level configuration schema.
- Packaging rules.
- Delivery rules.
- Future promotions or discounts.

For MVP, keep pricing simple:

```txt
variant base price
+ selected option deltas
= final product price
```

---

## 9. Backend Validation

Before accepting a price:

- Validate product exists.
- Validate variant belongs to product.
- Validate selected options exist.
- Validate selected options are active.
- Validate options are compatible.
- Validate quantity.
- Validate selected delivery date.
- Recalculate price on backend.
- Ignore any total sent from frontend.

Never trust frontend-calculated totals.

---

## 10. Testing Strategy

Create unit tests for:

- Base price calculation.
- Extra option pricing.
- Multi-option pricing.
- Invalid options.
- Incompatible options.
- Missing required options.
- Quantity changes.
- CLP formatting.
- Backend recalculation.

Example test cases:

```txt
Torta 10 personas without extras returns base price.
Torta 15 personas with vegan option adds vegan delta.
Sugar-free option disables sugar-based decoration.
Invalid option id fails validation.
Frontend total mismatch is ignored.
```

---

## 11. AI Agent Instructions

When implementing the pricing engine:

- Keep functions pure where possible.
- Avoid UI dependencies.
- Avoid hardcoding product-specific logic directly into functions.
- Use configuration-driven rules.
- Use integer amounts.
- Write unit tests early.
- Treat backend calculation as final authority.
