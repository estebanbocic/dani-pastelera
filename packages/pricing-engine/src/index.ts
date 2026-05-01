import type { PriceCalculationResult, LocalizedText } from "@dani-pastelera/shared-types"

export type CalculatePriceInput = {
  productId: string
  variantId: string
  quantity: number
  selectedOptions: Record<string, string | string[] | boolean | number>
  currencyCode: "CLP"
}

export type ValidationResult = {
  valid: boolean
  errors: LocalizedText[]
}

/**
 * Calculate the final product price based on variant + selected options.
 * This is a placeholder — full implementation in Phase 4.
 */
export function calculateProductPrice(
  _input: CalculatePriceInput
): PriceCalculationResult {
  // TODO: Implement in Phase 4
  return {
    currencyCode: "CLP",
    baseAmount: 0,
    extrasAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    breakdown: [],
  }
}

/**
 * Validate the price input before calculation.
 */
export function validatePriceInput(
  _input: CalculatePriceInput
): ValidationResult {
  // TODO: Implement in Phase 4
  return { valid: true, errors: [] }
}
