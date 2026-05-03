import { useState, useEffect, useMemo } from "react"
import { getCart, getCartId, updateCartCustomer, initPaymentCollection, initPaymentSession, completeCart, clearCartId, type Cart, type CartLineItem } from "../lib/cart"

/**
 * Adds N business days (Mon–Sat) to a date.
 * Sundays are skipped since no deliveries happen on Sundays.
 */
function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start)
  let added = 0
  while (added < days) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0) added++ // skip Sundays (0)
  }
  // If we land on Sunday, move to Monday
  if (d.getDay() === 0) d.setDate(d.getDate() + 1)
  return d
}

/** Returns true if the ISO date string falls on a Sunday. */
function isSunday(dateStr: string): boolean {
  if (!dateStr) return false
  // Use noon to avoid timezone edge cases
  return new Date(dateStr + "T12:00:00").getDay() === 0
}

/** Advances a Sunday date string to the following Monday. */
function nextMonday(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00")
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

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
  const [dateError, setDateError] = useState<string | null>(null)
  const [notes, setNotes] = useState("")

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
  const subtotal = cart?.total || cart?.subtotal || 0

  // Max preparation days across all cart items (in business days, Mon–Sat)
  const maxPrepDays = useMemo(() => {
    if (items.length === 0) return 2
    return Math.max(
      ...items.map((item) => {
        const prep = (item.variant?.product?.metadata as any)?.preparation_time_days
        return typeof prep === "number" ? prep : 2
      })
    )
  }, [items])

  const minDate = useMemo(() => {
    return addBusinessDays(new Date(), maxPrepDays).toISOString().split("T")[0]
  }, [maxPrepDays])

  const handleDateChange = (value: string) => {
    setDateError(null)
    if (isSunday(value)) {
      // Auto-advance to Monday and show a notice
      const monday = nextMonday(value)
      setDeliveryDate(monday)
      setDateError("📅 No realizamos entregas los domingos. Te asignamos el lunes siguiente.")
    } else {
      setDeliveryDate(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cart || items.length === 0) return

    setSubmitting(true)
    try {
      const deliveryInfo = {
        method: deliveryMethod,
        address: deliveryMethod === "delivery" ? address : undefined,
        commune: deliveryMethod === "delivery" ? commune : undefined,
        date: deliveryDate,
        notes: notes || undefined,
      }

      // 1. Update cart with customer email and delivery metadata
      await updateCartCustomer(cart.id, email, {
        customer_name: name,
        customer_phone: phone,
        delivery_info: deliveryInfo,
      })

      // 2. Initialize payment collection + session
      const paymentCollection = await initPaymentCollection(cart.id)
      await initPaymentSession(paymentCollection.id)

      // 3. Complete the cart → creates a Medusa order
      const result = await completeCart(cart.id)

      // 3. Store data for confirmation page
      const checkoutData = {
        cartId: cart.id,
        orderId: result.order?.id,
        orderDisplayId: result.order?.display_id,
        customer: { name, email, phone },
        delivery: deliveryInfo,
      }
      sessionStorage.setItem("dani_checkout_data", JSON.stringify(checkoutData))
      sessionStorage.setItem("dani_checkout_cart", JSON.stringify(cart))

      // 4. Clear cart ID (order is now created)
      clearCartId()

      // 5. Redirect to confirmation
      // TODO: When Mercado Pago is configured, redirect to MP payment URL instead
      window.location.href = "/orden-confirmada"
    } catch (err: any) {
      console.error("Checkout error:", err)
      alert(err.message || "Error al procesar el pedido. Por favor intenta de nuevo.")
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
                    {Object.entries(item.metadata.selected_options as Record<string, string>)
                      .filter(([key]) => key !== "delivery_date") // Date handled globally in checkout
                      .map(([key, value]) => value ? (
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
            Fecha de entrega *
            <span className="ml-1 text-[#8B6F47] font-semibold">
              (mínimo {maxPrepDays} día{maxPrepDays !== 1 ? "s" : ""} hábil{maxPrepDays !== 1 ? "es" : ""},
              entregas lunes a sábado)
            </span>
          </label>
          <input
            type="date"
            required
            min={minDate}
            value={deliveryDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl text-sm focus:border-[#8B6F47] focus:outline-none"
          />
          {dateError && (
            <p className="text-xs text-amber-600 mt-1">{dateError}</p>
          )}
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
