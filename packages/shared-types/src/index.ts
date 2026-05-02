// ─── Localization ───────────────────────────────────────────

export type LocalizedText = {
  es: string
  en?: string
}

export type LocalizedSlug = {
  es: string
  en?: string
}

// ─── Dietary & Allergen Tags ────────────────────────────────

export type DietaryTag =
  | "sugar_free"
  | "keto"
  | "vegan"
  | "lactose_free"
  | "diabetic_friendly"
  | "low_carb"
  // Kept for backward compatibility — not displayed publicly
  | "gluten_free"
  | "celiac_friendly"

export type AllergenTag =
  | "nuts"
  | "egg"
  | "milk"
  | "soy"
  | "peanuts"
  | "almonds"
  | "wheat"

// ─── Pricing ────────────────────────────────────────────────

export type CurrencyCode = "CLP"

export type PriceBreakdownItem = {
  id: string
  label: LocalizedText
  type: "base" | "extra" | "discount"
  amount: number
}

export type PriceCalculationResult = {
  currencyCode: CurrencyCode
  baseAmount: number
  extrasAmount: number
  discountAmount: number
  totalAmount: number
  breakdown: PriceBreakdownItem[]
  warnings?: LocalizedText[]
}

// ─── Product Configuration ──────────────────────────────────

export type CustomizationStepType =
  | "single_select"
  | "multi_select"
  | "boolean"
  | "text"
  | "date"

export type CustomizationOption = {
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

export type CustomizationStep = {
  id: string
  label: LocalizedText
  description?: LocalizedText
  type: CustomizationStepType
  required: boolean
  options?: CustomizationOption[]
}

export type CustomizationSchema = {
  id: string
  productId: string
  steps: CustomizationStep[]
}

// ─── Delivery ───────────────────────────────────────────────

export type DeliveryMethod = "pickup" | "delivery"

export type DeliveryInfo = {
  method: DeliveryMethod
  address?: string
  commune?: string
  notes?: string
  date: string
  timeWindow?: string
}

// ─── Order Statuses ─────────────────────────────────────────

export type OrderStatus =
  | "new"
  | "payment_pending"
  | "payment_confirmed"
  | "in_preparation"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
