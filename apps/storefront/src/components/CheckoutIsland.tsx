import { useState, useEffect, useMemo } from "react"
import { getCart, getCartId, type Cart, type CartLineItem } from "../lib/cart"

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CheckoutIsland() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup")
  const [address, setAddress] = useState("")
  const [commune, setCommune] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [notes, setNotes] = useState("")

  const minDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split("T")[0]
  }, [])

  // Load cart
  useEffect(() => {
    const cartId = getCartId()
    if (cartId) {
      getCart(cartId).then((c) => {
        setCart(c)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const items = cart?.items || []
  const subtotal = cart?.subtotal || cart?.item_total || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart || items.length === 0) return

    setSubmitting(true)
    try {
      // For now, store checkout data and redirect to a confirmation
      // Mercado Pago integration will be wired here when credentials are provided
      const checkoutData = {
        cartId: cart.id,
        customer: { name, email, phone },
        delivery: {
          method: deliveryMethod,
          address: deliveryMethod === "delivery" ? address : undefined,
          commune: deliveryMethod === "delivery" ? commune : undefined,
          date: deliveryDate,
          notes,
        },
      }

      // Store checkout data for confirmation page
      sessionStorage.setItem("dani_checkout_data", JSON.stringify(checkoutData))
      sessionStorage.setItem("dani_checkout_cart", JSON.stringify(cart))

      // TODO: When Mercado Pago is configured:
      // 1. Update cart with customer info via Medusa API
      // 2. Create payment session
      // 3. Get Mercado Pago preference URL
      // 4. Redirect to Mercado Pago

      // For now, go directly to confirmation
      window.location.href = "/orden-confirmada"
    } catch (err) {
      console.error("Checkout error:", err)
      alert("Error al procesar el pedido. Por favor intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-[#6B5B4E]">Cargando...</div>
  }

  if (!cart || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🛒</div>
        <p className="text-[#6B5B4E] mb-4">Tu carrito está vacío</p>
        <a href="/productos" className="text-[#8B6F47] font-semibold hover:underline">
          Ver productos →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* Order Summary */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-4">
          Resumen del pedido
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#3D3028]">
                  {item.variant?.product?.title || item.title}
                </p>
                <p className="text-xs text-[#6B5B4E]">{item.variant?.title}</p>
                {item.metadata?.selected_options && (
                  <div className="mt-1">
                    {Object.entries(item.metadata.selected_options as Record<string, string>).map(
                      ([key, value]) => value ? (
                        <p key={key} className="text-xs text-[#6B5B4E]">• {value}</p>
                      ) : null
                    )}
                  </div>
                )}
              </div>
              <span className="font-bold text-[#8B6F47] text-sm ml-4">
                {formatCLP(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
          <span className="font-bold text-[#3D3028]">Total</span>
          <span className="font-bold text-lg text-[#8B6F47]">{formatCLP(subtotal)}</span>
        </div>
      </section>

      {/* Customer Info */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-4">
          Datos de contacto
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            required
            placeholder="Nombre completo *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
          />
          <input
            type="email"
            required
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
          />
          <input
            type="tel"
            required
            placeholder="Teléfono / WhatsApp *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
          />
        </div>
      </section>

      {/* Delivery Method */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-4">
          Entrega
        </h2>
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setDeliveryMethod("pickup")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              deliveryMethod === "pickup"
                ? "border-[#8B6F47] bg-[#8B6F47]/10 text-[#8B6F47]"
                : "border-gray-200 text-[#6B5B4E]"
            }`}
          >
            📍 Retiro en tienda
          </button>
          <button
            type="button"
            onClick={() => setDeliveryMethod("delivery")}
            className={`flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
              deliveryMethod === "delivery"
                ? "border-[#8B6F47] bg-[#8B6F47]/10 text-[#8B6F47]"
                : "border-gray-200 text-[#6B5B4E]"
            }`}
          >
            🚗 Delivery
          </button>
        </div>

        {deliveryMethod === "delivery" && (
          <div className="space-y-3">
            <input
              type="text"
              required
              placeholder="Dirección *"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Comuna *"
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
            />
          </div>
        )}

        <div className="mt-4">
          <label className="block text-xs text-[#6B5B4E] mb-1">
            Fecha de entrega * (mínimo 2 días de anticipación)
          </label>
          <input
            type="date"
            required
            min={minDate}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
          />
        </div>

        <textarea
          placeholder="Notas adicionales (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full p-3 mt-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none resize-none"
        />
      </section>

      {/* Payment */}
      <section className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-4">
          Pago
        </h2>
        <p className="text-sm text-[#6B5B4E] mb-4">
          Serás redirigido a Mercado Pago para completar tu pago de forma segura.
        </p>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-[#8B6F47] text-white rounded-xl font-bold text-base hover:bg-[#7A5F3D] transition-colors disabled:opacity-50"
        >
          {submitting ? "Procesando..." : `Pagar ${formatCLP(subtotal)} con Mercado Pago`}
        </button>
        <p className="text-xs text-center text-[#6B5B4E] mt-3">
          🔒 Pago seguro procesado por Mercado Pago
        </p>
      </section>

    </form>
  )
}
