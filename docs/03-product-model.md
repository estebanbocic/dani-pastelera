# Dani Pastelera — Product Model

## 1. Product Modeling Goal

The product model must support a small catalog with highly configurable pastry products.

The catalog is expected to have approximately 50 products, but each product can include several options that affect:

- Price.
- Availability.
- Preparation time.
- Dietary compatibility.
- Final order details.

The model should avoid creating thousands of SKU combinations.

---

## 2. Core Modeling Strategy

Use Medusa products and variants for major commercial choices.

Use custom configuration metadata for detailed pastry customization.

Recommended structure:

```txt
Medusa Product
  ↓
Medusa Variant
  ↓
Custom configuration schema
  ↓
Line item metadata
  ↓
Order details
```

---

## 3. Product

A product represents the main pastry item.

Examples:

- Torta Brownie Saludable.
- Cheesecake Sin Azúcar.
- Cupcakes Veganos.
- Galletas Sin Gluten.
- Caja de Regalo Saludable.

Recommended product fields:

```ts
type Product = {
  id: string
  slug: LocalizedSlug
  name: LocalizedText
  shortDescription: LocalizedText
  description: LocalizedText
  categoryIds: string[]
  dietaryTags: DietaryTag[]
  allergenTags: AllergenTag[]
  preparationTimeDays: number
  minOrderQuantity: number
  maxOrderQuantity?: number
  imageGallery: ProductImage[]
  customizationSchemaId?: string
  isActive: boolean
}
```

---

## 4. Localized Fields

The ecommerce must support Spanish and English.

Recommended type:

```ts
type LocalizedText = {
  es: string
  en?: string
}

type LocalizedSlug = {
  es: string
  en?: string
}
```

Spanish is required. English is optional at the beginning but the system must support it.

Fallback rule:

```txt
If English content is missing, fallback to Spanish.
```

---

## 5. Variants

Variants should be used only for major choices that behave like commercial product versions.

Good variant examples:

- 8 portions.
- 10 portions.
- 15 portions.
- 20 portions.
- Box of 6.
- Box of 12.
- Small / medium / large.

Avoid creating variants for every filling, coverage, or dietary combination.

Recommended variant fields:

```ts
type ProductVariant = {
  id: string
  productId: string
  title: LocalizedText
  basePrice: number
  portions?: number
  sizeLabel?: LocalizedText
  sku?: string
  preparationTimeDays?: number
}
```

---

## 6. Dietary Tags

Dietary tags communicate health and dietary characteristics.

Recommended tags:

```ts
type DietaryTag =
  | "gluten_free"
  | "sugar_free"
  | "vegan"
  | "lactose_free"
  | "celiac_friendly"
  | "diabetic_friendly"
  | "low_carb"
```

Customer-facing labels:

```txt
gluten_free       → Sin gluten / Gluten-free
sugar_free        → Sin azúcar / Sugar-free
vegan             → Vegano / Vegan
lactose_free      → Sin lactosa / Lactose-free
celiac_friendly   → Apto celíacos / Celiac-friendly
diabetic_friendly → Apto diabéticos / Diabetic-friendly
```

---

## 7. Allergen Tags

Allergen information must be visible and clear.

Recommended allergen tags:

```ts
type AllergenTag =
  | "nuts"
  | "egg"
  | "milk"
  | "soy"
  | "peanuts"
  | "almonds"
  | "wheat"
```

Customer-facing labels:

```txt
nuts    → Contiene frutos secos / Contains nuts
egg     → Contiene huevo / Contains egg
milk    → Contiene lácteos / Contains dairy
soy     → Contiene soya / Contains soy
wheat   → Contiene trigo / Contains wheat
```

Important: Dietary tags and allergen tags are different concepts. A product can be gluten-free and still contain nuts, egg, or dairy.

---

## 8. Customization Schema

Each configurable product may have a customization schema.

Example:

```ts
type CustomizationSchema = {
  id: string
  productId: string
  steps: CustomizationStep[]
}
```

Each step defines a group of options.

Example steps:

- Size.
- Dietary profile.
- Filling.
- Coverage.
- Decoration.
- Message.
- Delivery date.
- Special notes.

---

## 9. Line Item Metadata

When a product is added to the cart, the selected configuration must be stored in line item metadata.

Example:

```json
{
  "selectedOptions": {
    "dietaryProfile": ["gluten_free", "sugar_free"],
    "filling": "frambuesa",
    "coverage": "chocolate_70",
    "decoration": "birthday",
    "message": "Feliz cumpleaños Jose",
    "deliveryDate": "2026-05-10"
  },
  "priceBreakdown": {
    "base": 32990,
    "extras": 6500,
    "total": 39490
  }
}
```

This metadata must be visible in:

- Cart.
- Checkout.
- Order confirmation.
- Admin order view.
- Email notifications.

---

## 10. Product Modeling Rules

Rules for the AI/developer:

- Do not create one variant per ingredient combination.
- Keep variants limited to size, portions, or package format.
- Use metadata for detailed customization.
- Always store selected configuration in the order.
- Always show dietary and allergen information.
- Always support Spanish and English labels.
- Always calculate price server-side before final order creation.
