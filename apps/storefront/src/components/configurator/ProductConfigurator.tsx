import { useState, useMemo } from "react"
import type { CustomizationSchema, CustomizationStep, PriceCalculationResult } from "@dani-pastelera/shared-types"
import OptionCard from "./OptionCard"
import PriceBreakdown from "./PriceBreakdown"

type VariantInfo = {
  id: string
  title: string
  price: number
}

type Props = {
  productTitle: string
  schema: CustomizationSchema
  variants: VariantInfo[]
  initialVariantId?: string
  onAddToCart?: (variantId: string, quantity: number, metadata: Record<string, any>) => Promise<void>
}

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

function calculatePrice(
  basePrice: number,
  baseLabel: string,
  schema: CustomizationSchema,
  selections: Record<string, string | undefined>
): PriceCalculationResult {
  const breakdown: PriceCalculationResult["breakdown"] = []
  let extrasAmount = 0

  breakdown.push({
    id: "base",
    label: { es: baseLabel },
    type: "base",
    amount: basePrice,
  })

  for (const step of schema.steps) {
    const value = selections[step.id]
    if (!value || !step.options) continue

    if (step.type === "text" && value.trim() !== "") {
      const opt = step.options[0]
      if (opt?.priceDelta && opt.priceDelta > 0) {
        extrasAmount += opt.priceDelta
        breakdown.push({ id: opt.id, label: step.label, type: "extra", amount: opt.priceDelta })
      }
      continue
    }

    if (step.type === "single_select") {
      const opt = step.options.find((o) => o.id === value)
      if (opt?.priceDelta && opt.priceDelta > 0) {
        extrasAmount += opt.priceDelta
        breakdown.push({ id: opt.id, label: opt.label, type: "extra", amount: opt.priceDelta })
      }
    }
  }

  return {
    currencyCode: "CLP",
    baseAmount: basePrice,
    extrasAmount,
    discountAmount: 0,
    totalAmount: basePrice + extrasAmount,
    breakdown,
  }
}

export default function ProductConfigurator({ productTitle, schema, variants, initialVariantId, onAddToCart }: Props) {
  const [addingToCart, setAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId || variants[0]?.id || "")
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState<Record<string, string | undefined>>(() => {
    const defaults: Record<string, string | undefined> = {}
    for (const step of schema.steps) {
      if (step.options) {
        const def = step.options.find((o) => o.isDefault)
        if (def) defaults[step.id] = def.id
      }
    }
    return defaults
  })

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0]
  // Date steps are removed — delivery date is chosen once in checkout
  const steps = schema.steps.filter((s) => s.type !== "date")

  // Compute disabled options from compatibility rules
  const disabledOptionIds = useMemo(() => {
    const rules = (schema as any).compatibilityRules || []
    const disabled: string[] = []
    const selectedIds = new Set(Object.values(selections).filter(Boolean) as string[])
    for (const rule of rules) {
      if (selectedIds.has(rule.condition.selectedOptionId)) {
        if (rule.effect.disableOptionIds) disabled.push(...rule.effect.disableOptionIds)
      }
    }
    return new Set(disabled)
  }, [selections, schema])

  // Live price calculation
  const pricing = useMemo(
    () => calculatePrice(selectedVariant.price, selectedVariant.title, schema, selections),
    [selectedVariant, schema, selections]
  )

  const handleSelect = (stepId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: optionId }))
  }

  const handleTextChange = (stepId: string, value: string) => {
    setSelections((prev) => ({ ...prev, [stepId]: value }))
  }

  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]

  return (
    <div className="space-y-4">
      {/* Variant selector */}
      <div>
        <h3 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-2">
          Tamaño
        </h3>
        <div className="flex flex-wrap gap-2">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${v.id === selectedVariantId
                  ? "bg-[#8B6F47] text-white"
                  : "bg-white border border-gray-200 text-[#3D3028] hover:border-[#8B6F47]"
                }`}
            >
              {v.title} — {formatCLP(v.price)}
            </button>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i === currentStep ? "bg-[#8B6F47]" : i < currentStep ? "bg-[#A8B5A0]" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Current step */}
      <div className="min-h-[200px]">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider">
            {step.label.es}
            {step.required && <span className="text-red-400 ml-1">*</span>}
          </h3>
          <span className="text-xs text-gray-400">
            Paso {currentStep + 1} de {steps.length}
          </span>
        </div>
        {step.description?.es && (
          <p className="text-xs text-[#6B5B4E] mb-3">{step.description.es}</p>
        )}

        {/* Single select options */}
        {step.type === "single_select" && step.options && (
          <div className="space-y-2">
            {step.options.filter((o) => o.isActive).map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                selected={selections[step.id] === option.id}
                disabled={disabledOptionIds.has(option.id)}
                onSelect={(id) => handleSelect(step.id, id)}
                formatPrice={formatCLP}
              />
            ))}
          </div>
        )}

        {/* Text input */}
        {step.type === "text" && (
          <div>
            <input
              type="text"
              maxLength={50}
              placeholder="Ej: Feliz cumpleaños María"
              value={selections[step.id] || ""}
              onChange={(e) => handleTextChange(step.id, e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-[#6B5B4E]">
                {step.options?.[0]?.priceDelta ? `+${formatCLP(step.options[0].priceDelta)} si agregas mensaje` : ""}
              </span>
              <span className="text-xs text-gray-400">
                {(selections[step.id] || "").length}/50
              </span>
            </div>
          </div>
        )}

      </div>

      {/* Price breakdown */}
      <PriceBreakdown
        breakdown={pricing.breakdown}
        total={pricing.totalAmount}
        formatPrice={formatCLP}
      />

      {/* Navigation */}
      <div className="flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-sm font-medium text-[#6B5B4E] hover:border-[#8B6F47]"
          >
            ← Anterior
          </button>
        )}
        {!isLastStep ? (
          <button
            onClick={() => setCurrentStep((s) => s + 1)}
            className="flex-1 py-3 rounded-xl bg-[#8B6F47] text-white text-sm font-semibold hover:bg-[#7A5F3D] transition-colors"
          >
            Continuar →
          </button>
        ) : (
          <button
            disabled={addingToCart}
            onClick={async () => {
              if (onAddToCart) {
                setAddingToCart(true)
                try {
                  await onAddToCart(selectedVariantId, 1, {
                    selected_options: selections,
                    price_breakdown: pricing.breakdown,
                    total_amount: pricing.totalAmount,
                  })
                  setAddedToCart(true)
                  setTimeout(() => setAddedToCart(false), 3000)
                } finally {
                  setAddingToCart(false)
                }
              } else {
                alert(`🛒 ${productTitle} — ${selectedVariant.title}\nTotal: ${formatCLP(pricing.totalAmount)}`)
              }
            }}
            className={`flex-1 py-3 rounded-xl text-white text-sm font-bold transition-colors ${
              addedToCart ? "bg-green-600" : "bg-[#8B6F47] hover:bg-[#7A5F3D]"
            }`}
          >
            {addingToCart ? "Agregando..." : addedToCart ? "✓ Agregado al carrito" : `🛒 Agregar al carrito — ${formatCLP(pricing.totalAmount)}`}
          </button>
        )}
      </div>
    </div>
  )
}
