import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

/**
 * Order Created Subscriber
 *
 * Triggered when a new order is placed.
 * Logs order details and prepares notification data.
 *
 * MVP: Logs to console. Will be extended with:
 * - Email to customer (order confirmation)
 * - Email to owner (new order notification)
 * - WhatsApp notification (future)
 */

export default async function orderCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  const orderId = event.data.id

  logger.info(`📦 [New Order] Order ${orderId} created!`)

  try {
    const query = container.resolve("query")

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "currency_code",
        "metadata",
        "items.*",
        "items.metadata",
      ],
      filters: { id: orderId },
    })

    const order = orders[0]
    if (!order) {
      logger.warn(`[New Order] Order ${orderId} not found`)
      return
    }

    logger.info(
      `📦 [New Order] #${order.display_id} | Email: ${order.email} | Total: $${order.total?.toLocaleString("es-CL")} ${order.currency_code?.toUpperCase()}`
    )

    // Log items with customizations
    for (const item of order.items || []) {
      const meta = item.metadata as Record<string, any> || {}
      logger.info(`   → ${item.title} (qty: ${item.quantity})`)
      if (meta.selected_options) {
        for (const [key, value] of Object.entries(meta.selected_options)) {
          if (value) logger.info(`     • ${key}: ${value}`)
        }
      }
    }

    // Delivery info
    const deliveryInfo = (order.metadata as any)?.delivery_info
    if (deliveryInfo) {
      logger.info(
        `   🚗 ${deliveryInfo.method === "pickup" ? "Retiro" : "Delivery"} | Fecha: ${deliveryInfo.date}`
      )
    }

    // TODO: Send email to customer
    // TODO: Send email/notification to owner
    // TODO: WhatsApp notification (future)

  } catch (err: any) {
    logger.error(`[New Order] Error processing order ${orderId}: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
