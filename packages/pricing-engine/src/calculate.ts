import type {
  PriceCalculationResult,
  PriceBreakdownItem,
  CustomizationSchema,
  CustomizationOption,
  LocalizedText,
} from "@dani-pastelera/shared-types"

export type CalculatePriceInput = {
  basePrice: number
  baseLabel: LocalizedText
  schema: CustomizationSchema | null
  selections: Record<string, string | string[] | boolean | number | undefined>
  currencyCode: "CLP"
}

/**
 * Calculate total price = base variant price + sum of selected option deltas.
 * Returns a full breakdown for display.
 */
export function calculateProductPrice(
  input: CalculatePriceInput
): PriceCalculationResult {
  const breakdown: PriceBreakdownItem[] = []
  let extrasAmount = 0

  // Base price
  breakdown.push({
    id: "base",
    label: input.baseLabel,
    type: "base",
    amount: input.basePrice,
  })

  if (input.schema) {
    for (const step of input.schema.steps) {
      const value = input.selections[step.id]
      if (!value || !step.options) continue

      // For text fields with a value, charge the message delta
      if (step.type === "text" && typeof value === "string" && value.trim() !== "") {
        const textOption = step.options[0]
        if (textOption?.priceDelta && textOption.priceDelta > 0) {
          extrasAmount += textOption.priceDelta
          breakdown.push({
            id: textOption.id,
            label: step.label,
            type: "extra",
            amount: textOption.priceDelta,
          })
        }
        continue
      }

      // For single_select, find the selected option and its delta
      if (step.type === "single_select" && typeof value === "string") {
        const option = step.options.find((o) => o.id === value)
        if (option?.priceDelta && option.priceDelta > 0) {
          extrasAmount += option.priceDelta
          breakdown.push({
            id: option.id,
            label: option.label,
            type: "extra",
            amount: option.priceDelta,
          })
        }
      }
    }
  }

  return {
    currencyCode: input.currencyCode,
    baseAmount: input.basePrice,
    extrasAmount,
    discountAmount: 0,
    totalAmount: input.basePrice + extrasAmount,
    breakdown,
  }
}
