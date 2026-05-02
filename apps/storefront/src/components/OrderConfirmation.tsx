import { useState, useEffect } from "react"
import { clearCartId } from "../lib/cart"

function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function OrderConfirmation() {
  const [checkoutData, setCheckoutData] = useState<any>(null)
  const [cart, setCart] = useState<any>(null)

  useEffect(() => {
    const data = sessionStorage.getItem("dani_checkout_data")
    const cartData = sessionStorage.getItem("dani_checkout_cart")
    if (data) setCheckoutData(JSON.parse(data))
    if (cartData) setCart(JSON.parse(cartData))

    // Clear cart after successful order
    clearCartId()
    sessionStorage.removeItem("dani_checkout_data")
    sessionStorage.removeItem("dani_checkout_cart")
  }, [])

  if (!checkoutData || !cart) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🧁</div>
        <h1 className="text-2xl font-bold text-[#8B6F47] mb-4">No hay pedido pendiente</h1>
        <a href="/productos" className="text-[#8B6F47] font-semibold hover:underline">
          Ver productos →
        </a>
      </div>
    )
  }

  const items = cart.items || []
  const subtotal = cart.subtotal || cart.item_total || 0

  return (
    <div className="text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-3xl font-bold text-[#8B6F47] mb-2">
        ¡Gracias por tu pedido!
      </h1>
      {checkoutData.orderDisplayId && (
        <p className="text-lg font-semibold text-[#3D3028] mb-2">
          Pedido #{checkoutData.orderDisplayId}
        </p>
      )}
      <p className="text-[#6B5B4E] mb-8">
        Recibimos tu compra y comenzaremos a prepararla según la fecha seleccionada.
      </p>

      {/* Order details */}
      <div className="bg-white rounded-2xl p-6 shadow-sm text-left mb-6">
        <h2 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-4">
          Detalle del pedido
        </h2>
        <div className="space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-semibold text-sm text-[#3D3028]">
                  {item.variant?.product?.title || item.title}
                </p>
                <p className="text-xs text-[#6B5B4E]">{item.variant?.title}</p>
              </div>
              <span className="font-bold text-[#8B6F47] text-sm">
                {formatCLP(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
          <span className="font-bold">Total</span>
          <span className="font-bold text-lg text-[#8B6F47]">{formatCLP(subtotal)}</span>
        </div>
      </div>

      {/* Customer & delivery info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm text-left mb-6">
        <h2 className="text-sm font-bold text-[#8B6F47] uppercase tracking-wider mb-4">
          Información de entrega
        </h2>
        <div className="space-y-2 text-sm text-[#6B5B4E]">
          <p><strong className="text-[#3D3028]">Nombre:</strong> {checkoutData.customer.name}</p>
          <p><strong className="text-[#3D3028]">Email:</strong> {checkoutData.customer.email}</p>
          <p><strong className="text-[#3D3028]">Teléfono:</strong> {checkoutData.customer.phone}</p>
          <p>
            <strong className="text-[#3D3028]">Método:</strong>{" "}
            {checkoutData.delivery.method === "pickup" ? "📍 Retiro en tienda" : "🚗 Delivery"}
          </p>
          {checkoutData.delivery.address && (
            <p><strong className="text-[#3D3028]">Dirección:</strong> {checkoutData.delivery.address}, {checkoutData.delivery.commune}</p>
          )}
          <p><strong className="text-[#3D3028]">Fecha de entrega:</strong> {checkoutData.delivery.date}</p>
          {checkoutData.delivery.notes && (
            <p><strong className="text-[#3D3028]">Notas:</strong> {checkoutData.delivery.notes}</p>
          )}
        </div>
      </div>

      <div className="bg-[#F5D5CB] rounded-2xl p-6 mb-8">
        <p className="text-sm text-[#3D3028]">
          📧 Te enviaremos un email de confirmación a <strong>{checkoutData.customer.email}</strong>
        </p>
        <p className="text-sm text-[#6B5B4E] mt-2">
          ¿Tienes dudas? Escríbenos por WhatsApp al +56 9 XXXX XXXX
        </p>
      </div>

      <a
        href="/"
        className="inline-block px-8 py-3 bg-[#8B6F47] text-white rounded-xl font-semibold hover:bg-[#7A5F3D] transition-colors no-underline"
      >
        Volver al inicio
      </a>
    </div>
  )
}
