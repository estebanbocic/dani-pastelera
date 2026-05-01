import type {
  CustomizationSchema,
  CustomizationStep,
  LocalizedText,
} from "@dani-pastelera/shared-types"

export type ValidationError = {
  stepId: string
  message: LocalizedText
}

export function validateConfiguration(
  schema: CustomizationSchema,
  selections: Record<string, string | string[] | boolean | number | undefined>
): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = []

  for (const step of schema.steps) {
    const value = selections[step.id]

    // Check required fields
    if (step.required) {
      if (value === undefined || value === null || value === "") {
        errors.push({
          stepId: step.id,
          message: {
            es: `${step.label.es} es obligatorio`,
            en: `${step.label.en || step.label.es} is required`,
          },
        })
        continue
      }
    }

    // Skip validation for empty optional fields
    if (value === undefined || value === null || value === "") continue

    // Validate by type
    switch (step.type) {
      case "single_select": {
        if (step.options) {
          const validIds = step.options.filter((o) => o.isActive).map((o) => o.id)
          if (!validIds.includes(value as string)) {
            errors.push({
              stepId: step.id,
              message: {
                es: `Opción inválida para ${step.label.es}`,
                en: `Invalid option for ${step.label.en || step.label.es}`,
              },
            })
          }
        }
        break
      }
      case "text": {
        const text = String(value)
        if (text.length > 50) {
          errors.push({
            stepId: step.id,
            message: {
              es: "El mensaje no puede superar los 50 caracteres",
              en: "Message cannot exceed 50 characters",
            },
          })
        }
        break
      }
      case "date": {
        const date = new Date(value as string)
        if (isNaN(date.getTime())) {
          errors.push({
            stepId: step.id,
            message: {
              es: "Fecha inválida",
              en: "Invalid date",
            },
          })
        } else {
          const minDate = new Date()
          minDate.setDate(minDate.getDate() + 2)
          minDate.setHours(0, 0, 0, 0)
          if (date < minDate) {
            errors.push({
              stepId: step.id,
              message: {
                es: "La fecha debe ser al menos 2 días desde hoy",
                en: "Date must be at least 2 days from today",
              },
            })
          }
        }
        break
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
