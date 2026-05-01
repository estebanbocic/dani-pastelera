import type { PriceBreakdownItem } from "@dani-pastelera/shared-types"

type Props = {
  breakdown: PriceBreakdownItem[]
  total: number
  formatPrice: (amount: number) => string
}

export default function PriceBreakdown({ breakdown, total, formatPrice }: Props) {
  if (breakdown.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-3">
        Resumen de precio
      </h3>
      <div className="space-y-1.5">
        {breakdown.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-[#6B5B4E]">{item.label.es}</span>
            <span className={item.type === "extra" ? "text-[#8B6F47] font-medium" : "text-[#3D3028]"}>
              {item.type === "extra" ? "+" : ""}{formatPrice(item.amount)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between">
        <span className="font-bold text-[#3D3028]">Total</span>
        <span className="font-bold text-lg text-[#8B6F47]">{formatPrice(total)}</span>
      </div>
    </div>
  )
}
