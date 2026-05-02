/**
 * Customer order confirmation email template.
 * Sent to the customer after their order is placed.
 * Language: Spanish (default).
 */

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

const DIETARY_LABELS: Record<string, string> = {
  sugar_free: "Sin azúcar",
  keto: "Keto",
  vegan: "Vegano",
  lactose_free: "Sin lactosa",
  diabetic_friendly: "Apto diabéticos",
  low_carb: "Bajo en carbohidratos",
}

export interface OrderEmailData {
  display_id: number | string
  email: string
  total: number
  currency_code: string
  items: Array<{
    title: string
    quantity: number
    unit_price: number
    metadata?: Record<string, any>
    variant?: {
      title?: string
      product?: {
        title?: string
        metadata?: Record<string, any>
      }
    }
  }>
  metadata?: Record<string, any>
}

function formatCLP(amount: number): string {
  return `$${Math.round(amount).toLocaleString("es-CL")}`
}

function renderItemCustomizations(item: OrderEmailData["items"][0]): string {
  const meta = item.metadata || {}
  const selectedOptions = (meta.selected_options || {}) as Record<string, string>
  const priceBreakdown = (meta.price_breakdown || []) as Array<{
    id: string
    label: { es?: string } | string
    type: string
    amount: number
  }>

  const productMeta = item.variant?.product?.metadata || {}
  const dietaryTags = (productMeta.dietary_tags || []) as string[]

  let html = ""

  if (Object.keys(selectedOptions).length > 0) {
    html += `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">`
    for (const [key, value] of Object.entries(selectedOptions)) {
      if (!value) continue
      const label = OPTION_LABELS[key] || key
      html += `
        <tr>
          <td style="color:#888;font-size:13px;padding:2px 0;width:160px;">${label}:</td>
          <td style="font-size:13px;color:#333;font-weight:600;">${value}</td>
        </tr>`
    }
    html += `</table>`
  }

  if (dietaryTags.length > 0) {
    const badges = dietaryTags
      .map(
        (tag) =>
          `<span style="display:inline-block;background:#e8f5e9;color:#2e7d32;font-size:11px;padding:2px 8px;border-radius:12px;margin:2px;">${DIETARY_LABELS[tag] || tag}</span>`
      )
      .join("")
    html += `<div style="margin:6px 0;">${badges}</div>`
  }

  if (priceBreakdown.length > 0) {
    html += `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid #eee;padding-top:6px;">`
    for (const line of priceBreakdown) {
      const label =
        typeof line.label === "object" ? line.label.es || String(line.label) : line.label
      const prefix = line.type === "extra" ? "+" : ""
      html += `
        <tr>
          <td style="font-size:12px;color:#666;">${label}</td>
          <td style="font-size:12px;color:#333;text-align:right;">${prefix}${formatCLP(line.amount)}</td>
        </tr>`
    }
    html += `</table>`
  }

  return html
}

function renderDeliveryInfo(meta: Record<string, any>): string {
  const info = meta.delivery_info as Record<string, any> | undefined
  if (!info) return ""

  const method = info.method === "pickup" ? "📍 Retiro en tienda" : "🚗 Delivery a domicilio"
  let html = `
    <div style="background:#f9f5f0;border-radius:8px;padding:16px;margin:24px 0;">
      <h3 style="margin:0 0 12px;font-size:15px;color:#5c3317;">Información de entrega</h3>
      <p style="margin:4px 0;font-size:14px;"><strong>Método:</strong> ${method}</p>`

  if (info.date) {
    html += `<p style="margin:4px 0;font-size:14px;"><strong>📅 Fecha:</strong> ${info.date}</p>`
  }
  if (info.address) {
    html += `<p style="margin:4px 0;font-size:14px;"><strong>Dirección:</strong> ${info.address}${info.commune ? `, ${info.commune}` : ""}</p>`
  }
  if (info.notes) {
    html += `<p style="margin:4px 0;font-size:14px;"><strong>Notas:</strong> ${info.notes}</p>`
  }

  html += `</div>`
  return html
}

export function buildOrderConfirmationHtml(order: OrderEmailData): string {
  const orderMeta = (order.metadata || {}) as Record<string, any>
  const itemsHtml = order.items
    .map((item) => {
      const productTitle = item.variant?.product?.title || item.title
      const variantTitle = item.variant?.title || ""
      const lineTotal = (item.unit_price || 0) * (item.quantity || 1)
      const customizations = renderItemCustomizations(item)

      return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #eee;">
          <div style="font-weight:600;font-size:15px;color:#2d2d2d;">${productTitle}${variantTitle ? ` — ${variantTitle}` : ""}</div>
          <div style="font-size:13px;color:#666;margin-top:2px;">Cantidad: ${item.quantity}</div>
          ${customizations}
        </td>
        <td style="padding:16px 0;border-bottom:1px solid #eee;text-align:right;vertical-align:top;">
          <div style="font-weight:600;font-size:15px;color:#2d2d2d;">${formatCLP(lineTotal)}</div>
        </td>
      </tr>`
    })
    .join("")

  const deliveryHtml = renderDeliveryInfo(orderMeta)

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de pedido #${order.display_id}</title>
</head>
<body style="margin:0;padding:0;background:#faf7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#5c3317;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">🧁 Dani Pastelera</h1>
              <p style="margin:8px 0 0;color:#e8c9a0;font-size:14px;">danipastelera.cl</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;font-size:20px;color:#2d2d2d;">¡Tu pedido está confirmado!</h2>
              <p style="margin:0 0 24px;color:#666;font-size:15px;">
                Hola, gracias por tu compra. Recibimos tu pedido y lo estamos preparando con mucho cariño.
              </p>

              <!-- Order ID -->
              <div style="background:#f9f5f0;border-left:4px solid #5c3317;padding:12px 16px;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0;font-size:14px;color:#888;">Número de pedido</p>
                <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#5c3317;">#${order.display_id}</p>
              </div>

              <!-- Items -->
              <h3 style="margin:0 0 12px;font-size:16px;color:#2d2d2d;">Resumen del pedido</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
                <tr>
                  <td style="padding:16px 0 0;text-align:right;" colspan="2">
                    <span style="font-size:16px;color:#888;">Total: </span>
                    <span style="font-size:20px;font-weight:700;color:#5c3317;">${formatCLP(order.total)}</span>
                  </td>
                </tr>
              </table>

              ${deliveryHtml}

              <p style="margin:24px 0 0;font-size:14px;color:#666;">
                Si tienes alguna pregunta, responde a este correo o contáctanos por WhatsApp.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f5f0;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                © 2025 Dani Pastelera · danipastelera.cl
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function buildOrderConfirmationText(order: OrderEmailData): string {
  const lines: string[] = [
    `¡Pedido confirmado! #${order.display_id}`,
    ``,
    `Hola, tu pedido en Dani Pastelera ha sido recibido.`,
    ``,
    `RESUMEN DEL PEDIDO`,
    `------------------`,
  ]

  for (const item of order.items) {
    const productTitle = item.variant?.product?.title || item.title
    const variantTitle = item.variant?.title || ""
    lines.push(`• ${productTitle}${variantTitle ? ` — ${variantTitle}` : ""} (x${item.quantity}) — ${formatCLP(item.unit_price * item.quantity)}`)
    const options = (item.metadata?.selected_options || {}) as Record<string, string>
    for (const [key, value] of Object.entries(options)) {
      if (value) lines.push(`  ${OPTION_LABELS[key] || key}: ${value}`)
    }
  }

  lines.push(``, `Total: ${formatCLP(order.total)}`)

  const delivery = (order.metadata as any)?.delivery_info
  if (delivery) {
    lines.push(``, `ENTREGA`, `-------`)
    lines.push(`Método: ${delivery.method === "pickup" ? "Retiro en tienda" : "Delivery"}`)
    if (delivery.date) lines.push(`Fecha: ${delivery.date}`)
    if (delivery.address) lines.push(`Dirección: ${delivery.address}${delivery.commune ? `, ${delivery.commune}` : ""}`)
    if (delivery.notes) lines.push(`Notas: ${delivery.notes}`)
  }

  lines.push(``, `Dani Pastelera · danipastelera.cl`)
  return lines.join("\n")
}
