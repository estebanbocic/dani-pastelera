import { useCart } from "./CartProvider"

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CartDrawer() {
  const { cart, items, itemCount, isOpen, isLoading, closeCart, removeItem, updateItemQuantity } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#FFF8F0] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#8B6F47]">
            🛒 Carrito ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-[#6B5B4E]"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🧁</div>
              <p className="text-[#6B5B4E]">Tu carrito está vacío</p>
              <a
                href="/productos"
                className="inline-block mt-4 text-[#8B6F47] font-semibold text-sm hover:underline"
                onClick={closeCart}
              >
                Ver productos →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-[#3D3028]">
                        {item.variant?.product?.title || item.title}
                      </h3>
                      <p className="text-xs text-[#6B5B4E] mt-0.5">
                        {item.variant?.title}
                      </p>
                      {/* Show selected options from metadata */}
                      {item.metadata?.selected_options && (
                        <div className="mt-2 space-y-0.5">
                          {Object.entries(item.metadata.selected_options as Record<string, string>).map(
                            ([key, value]) =>
                              value && key !== "delivery_date" ? (
                                <p key={key} className="text-xs text-[#6B5B4E]">
                                  • {value}
                                </p>
                              ) : null
                          )}
                          {item.metadata.selected_options.delivery_date && (
                            <p className="text-xs text-[#6B5B4E]">
                              📅 {item.metadata.selected_options.delivery_date}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      aria-label={`Eliminar ${item.variant?.product?.title || item.title} del carrito`}
                      className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    ><svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2" aria-label={`Cantidad de ${item.variant?.product?.title || item.title}`}>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        disabled={isLoading || item.quantity === 1}
                        aria-label="Reducir cantidad"
                        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#8B6F47] text-xl font-bold text-[#8B6F47] transition-colors hover:bg-[#F5D5CB] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center font-bold text-[#3D3028]" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        disabled={isLoading}
                        aria-label="Aumentar cantidad"
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B6F47] text-xl font-bold text-white shadow-sm transition-colors hover:bg-[#7A5F3D] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-[#8B6F47]">
                      {formatCLP(item.unit_price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B5B4E]">Subtotal</span>
              <span className="font-bold text-[#3D3028]">
                {formatCLP(cart?.total || cart?.subtotal || 0)}
              </span>
            </div>
            <a
              href="/checkout"
              className="block w-full py-3 bg-[#8B6F47] text-white text-center rounded-xl font-semibold hover:bg-[#7A5F3D] transition-colors no-underline"
              onClick={closeCart}
            >
              Ir al checkout
            </a>
          </div>
        )}
      </div>
    </>
  )
}
