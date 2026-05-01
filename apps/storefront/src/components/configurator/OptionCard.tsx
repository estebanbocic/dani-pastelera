import type { CustomizationOption } from "@dani-pastelera/shared-types"

type Props = {
  option: CustomizationOption
  selected: boolean
  disabled: boolean
  onSelect: (optionId: string) => void
  formatPrice: (amount: number) => string
}

export default function OptionCard({ option, selected, disabled, onSelect, formatPrice }: Props) {
  const label = option.label.es
  const delta = option.priceDelta || 0

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className={`
        w-full text-left p-3 rounded-xl border-2 transition-all duration-200
        ${selected
          ? "border-[#8B6F47] bg-[#8B6F47]/10"
          : disabled
            ? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
            : "border-gray-200 bg-white hover:border-[#8B6F47]/50 cursor-pointer"
        }
      `}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
            ${selected ? "border-[#8B6F47] bg-[#8B6F47]" : "border-gray-300"}`}>
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
          <span className={`font-medium text-sm ${disabled ? "text-gray-400" : "text-[#3D3028]"}`}>
            {label}
          </span>
        </div>
        {delta > 0 && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
            ${selected ? "bg-[#8B6F47] text-white" : "bg-[#F5D5CB] text-[#8B6F47]"}`}>
            +{formatPrice(delta)}
          </span>
        )}
        {delta === 0 && option.isDefault && (
          <span className="text-xs text-gray-400">Incluido</span>
        )}
      </div>
      {option.description?.es && (
        <p className="text-xs text-[#6B5B4E] mt-1 ml-7">{option.description.es}</p>
      )}
      {disabled && (
        <p className="text-xs text-red-400 mt-1 ml-7">No disponible con la selección actual</p>
      )}
    </button>
  )
}
