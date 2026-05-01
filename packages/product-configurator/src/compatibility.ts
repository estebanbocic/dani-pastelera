import type { LocalizedText } from "@dani-pastelera/shared-types"

export type CompatibilityRule = {
  id: string
  condition: { selectedOptionId: string }
  effect: {
    disableOptionIds?: string[]
    requireOptionIds?: string[]
    showWarning?: LocalizedText
  }
}

export function applyCompatibilityRules(
  rules: CompatibilityRule[],
  selections: Record<string, string | string[] | boolean | number | undefined>
): { disabledOptionIds: string[]; warnings: LocalizedText[] } {
  const disabledOptionIds: string[] = []
  const warnings: LocalizedText[] = []

  // Collect all selected option IDs
  const selectedIds = new Set<string>()
  for (const value of Object.values(selections)) {
    if (typeof value === "string") selectedIds.add(value)
    if (Array.isArray(value)) value.forEach((v) => selectedIds.add(v))
  }

  for (const rule of rules) {
    if (selectedIds.has(rule.condition.selectedOptionId)) {
      if (rule.effect.disableOptionIds) {
        disabledOptionIds.push(...rule.effect.disableOptionIds)
      }
      if (rule.effect.showWarning) {
        warnings.push(rule.effect.showWarning)
      }
    }
  }

  return {
    disabledOptionIds: [...new Set(disabledOptionIds)],
    warnings,
  }
}
