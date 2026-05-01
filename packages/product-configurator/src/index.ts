import type {
  CustomizationSchema,
  CustomizationStep,
  CustomizationOption,
  LocalizedText,
} from "@dani-pastelera/shared-types"

export type CompatibilityRule = {
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

export type ConfigurationState = {
  schemaId: string
  selections: Record<string, string | string[] | boolean | number>
  disabledOptionIds: string[]
  warnings: LocalizedText[]
}

/**
 * Validate the current configuration selections against a schema.
 * Placeholder — full implementation in Phase 3.
 */
export function validateConfiguration(
  _schema: CustomizationSchema,
  _selections: Record<string, string | string[] | boolean | number>
): { valid: boolean; errors: LocalizedText[] } {
  // TODO: Implement in Phase 3
  return { valid: true, errors: [] }
}

/**
 * Apply compatibility rules to determine which options should be disabled.
 * Placeholder — full implementation in Phase 3.
 */
export function applyCompatibilityRules(
  _rules: CompatibilityRule[],
  _selections: Record<string, string | string[] | boolean | number>
): { disabledOptionIds: string[]; warnings: LocalizedText[] } {
  // TODO: Implement in Phase 3
  return { disabledOptionIds: [], warnings: [] }
}

// Re-export types for convenience
export type { CustomizationSchema, CustomizationStep, CustomizationOption }
