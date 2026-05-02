import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendCustomerConfirmation, sendOwnerNotification } from "../lib/email"

/**
 * Order Created Subscriber
 *
 * Triggered when a new order is placed.
 * - Logs order details to console
 * - Sends confirmation email to customer
 * - Sends notification email to owner
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
      if (!item) continue
      const meta = (item.metadata as Record<string, any>) ?? {}
      logger.info(`   → ${item.title ?? ""} (qty: ${item.quantity ?? 0})`)
      if (meta.selected_options) {
        for (const [key, value] of Object.entries(meta.selected_options as Record<string, unknown>)) {
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

    // Send emails (graceful — errors are caught inside helpers)
    await Promise.all([
      sendCustomerConfirmation(order as any, logger),
      sendOwnerNotification(order as any, logger),
    ])

    // TODO: WhatsApp notification (future)

  } catch (err: any) {
    logger.error(`[New Order] Error processing order ${orderId}: ${err.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
