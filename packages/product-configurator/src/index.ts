export { validateConfiguration } from "./validate.js"
export type { ValidationError } from "./validate.js"
export { applyCompatibilityRules } from "./compatibility.js"
export type { CompatibilityRule } from "./compatibility.js"

// Re-export types for convenience
export type {
  CustomizationSchema,
  CustomizationStep,
  CustomizationOption,
  LocalizedText,
} from "@dani-pastelera/shared-types"
