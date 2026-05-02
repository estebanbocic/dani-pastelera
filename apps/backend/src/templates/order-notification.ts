/**
 * Owner new-order notification email template.
 * Sent to the bakery owner when a new order is placed.
 * More operational detail than the customer template.
 * Language: Spanish.
 */

import type { OrderEmailData } from "./order-confirmation"

const OPTION_LABELS: Record<string, string> = {
  filling: "Relleno",
  coverage: "Cobertura",
  decoration: "Decoración",
  topping: "Topping",
  message: "Mensaje personalizado",
  delivery_date: "Fecha de entrega",
  size: "Tamaño",
  flavor: "Sabor",
}

const ALLERGEN_LABELS: Record<string, string> = {
  nuts: "Frutos secos",
  egg: "Huevo",
  milk: "Lácteos",
  soy: "Soya",
  peanuts: "Maní",
  almonds: "Almendras",
  wheat: "Trigo",
}

const DIETARY_LABELS: Record<string, string> = {
  sugar_free: "Sin azúcar",
  keto: "Keto",
  vegan: "Vegano",
  lactose_free: "Sin lactosa",
  diabetic_friendly: "Apto diabéticos",
  low_carb: "Bajo en carbohidratos",
}

function formatCLP(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-CL")}`
}

export function buildOwnerNotificationHtml(order: OrderEmailData): string {
  const orderMeta = (order.metadata || {}) as Record<string, any>
  const delivery = orderMeta.delivery_info as Record<string, any> | undefined

  const itemsHtml = order.items
    .map((item) => {
      const meta = item.metadata || {}
      const selectedOptions = (meta.selected_options || {}) as Record<string, string>
      const productMeta = item.variant?.product?.metadata || {}
      const dietaryTags = (productMeta.dietary_tags || []) as string[]
      const allergenTags = (productMeta.allergen_tags || []) as string[]
      const productTitle = item.variant?.product?.title || item.title
      const variantTitle = item.variant?.title || ""

      let optionsHtml = ""
      const hasOptions = Object.values(selectedOptions).some(Boolean)
      if (hasOptions) {
        optionsHtml += `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">`
        for (const [key, value] of Object.entries(selectedOptions)) {
          if (!value) continue
          const label = OPTION_LABELS[key] || key
          const isMessage = key === "message"
          optionsHtml += `
            <tr>
              <td style="color:#888;font-size:13px;padding:3px 0;width:160px;vertical-align:top;">${label}:</td>
              <td style="font-size:13px;color:#333;font-weight:${isMessage ? "400" : "600"};font-style:${isMessage ? "italic" : "normal"};">${value}</td>
            </tr>`
        }
        optionsHtml += `</table>`
      }

      const alertTags: string[] = []
      if (dietaryTags.includes("keto")) {
        alertTags.push('<span style="background:#f3f0e8;color:#5c3317;font-size:11px;padding:2px 8px;border-radius:12px;margin:2px;display:inline-block;">🥑 KETO</span>')
      }
      if (dietaryTags.includes("vegan")) {
        alertTags.push('<span style="background:#e8f5e9;color:#2e7d32;font-size:11px;padding:2px 8px;border-radius:12px;margin:2px;display:inline-block;">🌿 VEGANO</span>')
      }
      if (dietaryTags.includes("sugar_free") || dietaryTags.includes("diabetic_friendly")) {
        alertTags.push('<span style="background:#e3f2fd;color:#1565c0;font-size:11px;padding:2px 8px;border-radius:12px;margin:2px;display:inline-block;">🍯 SIN AZÚCAR</span>')
      }
      const allergenHtml = allergenTags.length > 0
        ? `<div style="margin:6px 0;font-size:12px;color:#c62828;">⚠️ Contiene: ${allergenTags.map((t) => ALLERGEN_LABELS[t] || t).join(", ")}</div>`
        : ""

      return `
      <div style="background:#f9f5f0;border-radius:8px;padding:16px;margin-bottom:12px;">
        <div style="font-weight:700;font-size:15px;color:#2d2d2d;">${productTitle}${variantTitle ? ` — ${variantTitle}` : ""}</div>
        <div style="font-size:13px;color:#666;margin-top:2px;">Cantidad: ${item.quantity} · ${formatCLP((item.unit_price || 0) * (item.quantity || 1))}</div>
        ${alertTags.length > 0 ? `<div style="margin:8px 0;">${alertTags.join("")}</div>` : ""}
        ${allergenHtml}
        ${optionsHtml}
      </div>`
    })
    .join("")

  const deliverySection = delivery
    ? `
    <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:16px;margin:24px 0;">
      <h3 style="margin:0 0 12px;font-size:15px;color:#5c3317;">🚗 Datos de entrega</h3>
      <p style="margin:4px 0;font-size:14px;"><strong>Método:</strong> ${delivery.method === "pickup" ? "📍 Retiro en tienda" : "🚗 Delivery"}</p>
      ${delivery.date ? `<p style="margin:4px 0;font-size:14px;"><strong>📅 Fecha:</strong> <span style="font-weight:700;color:#c62828;">${delivery.date}</span></p>` : ""}
      ${delivery.address ? `<p style="margin:4px 0;font-size:14px;"><strong>Dirección:</strong> ${delivery.address}${delivery.commune ? `, ${delivery.commune}` : ""}</p>` : ""}
      ${delivery.notes ? `<p style="margin:4px 0;font-size:14px;"><strong>Notas del cliente:</strong> <em>${delivery.notes}</em></p>` : ""}
    </div>`
    : ""

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuevo pedido #${order.display_id}</title>
</head>
<body style="margin:0;padding:0;background:#faf7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#2d7d32;padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">🔔 Nuevo pedido recibido</h1>
              <p style="margin:4px 0 0;color:#a5d6a7;font-size:13px;">Dani Pastelera Admin</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <!-- Order summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f5f0;border-radius:8px;padding:16px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:13px;color:#888;">Número de pedido</p>
                    <p style="margin:0;font-size:26px;font-weight:700;color:#5c3317;">#${order.display_id}</p>
                  </td>
                  <td style="text-align:right;vertical-align:top;">
                    <p style="margin:0 0 4px;font-size:13px;color:#888;">Total</p>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#2d7d32;">${formatCLP(order.total)}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top:12px;">
                    <p style="margin:0;font-size:14px;color:#555;"><strong>Cliente:</strong> ${order.email}</p>
                  </td>
                </tr>
              </table>

              <!-- Items -->
              <h3 style="margin:0 0 12px;font-size:16px;color:#2d2d2d;">Productos a preparar</h3>
              ${itemsHtml}

              ${deliverySection}

              <div style="margin-top:24px;text-align:center;">
                <a href="${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/app/orders"
                   style="display:inline-block;background:#5c3317;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                  Ver pedido en el admin →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f5f0;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#aaa;">Dani Pastelera · danipastelera.cl</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildOwnerNotificationText(order: OrderEmailData): string {
  const orderMeta = (order.metadata || {}) as Record<string, any>
  const delivery = orderMeta.delivery_info as Record<string, any> | undefined

  const lines: string[] = [
    `🔔 NUEVO PEDIDO #${order.display_id}`,
    `Total: ${formatCLP(order.total)}`,
    `Cliente: ${order.email}`,
    ``,
    `PRODUCTOS`,
    `---------`,
  ]

  for (const item of order.items) {
    const productTitle = item.variant?.product?.title || item.title
    const variantTitle = item.variant?.title || ""
    lines.push(`• ${productTitle}${variantTitle ? ` — ${variantTitle}` : ""} (x${item.quantity})`)
    const options = (item.metadata?.selected_options || {}) as Record<string, string>
    for (const [key, value] of Object.entries(options)) {
      if (value) lines.push(`  ${OPTION_LABELS[key] || key}: ${value}`)
    }
  }

  if (delivery) {
    lines.push(``, `ENTREGA`, `-------`)
    lines.push(`Método: ${delivery.method === "pickup" ? "Retiro en tienda" : "Delivery"}`)
    if (delivery.date) lines.push(`Fecha: ${delivery.date}`)
    if (delivery.address) lines.push(`Dirección: ${delivery.address}${delivery.commune ? `, ${delivery.commune}` : ""}`)
    if (delivery.notes) lines.push(`Notas: ${delivery.notes}`)
  }

  lines.push(``, `Ver en admin: ${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/app/orders`)
  return lines.join("\n")
}
