import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

/**
 * PUT /admin/orders/:id/status
 *
 * Updates the custom operational status of an order.
 * Status is stored in order.metadata.custom_status.
 *
 * This is separate from Medusa's built-in payment/fulfillment status.
 * It reflects the production workflow status visible to the owner.
 */

export const CUSTOM_ORDER_STATUSES = [
  "new",
  "payment_pending",
  "payment_confirmed",
  "in_preparation",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const

export type CustomOrderStatus = (typeof CUSTOM_ORDER_STATUSES)[number]

const UpdateStatusSchema = z.object({
  status: z.enum(CUSTOM_ORDER_STATUSES),
})

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const logger = req.scope.resolve("logger")

  // Validate body
  const parsed = UpdateStatusSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid status value",
      valid_statuses: CUSTOM_ORDER_STATUSES,
      errors: parsed.error.flatten().fieldErrors,
    })
  }

  const { status } = parsed.data

  try {
    const query = req.scope.resolve("query")

    // Verify order exists
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "metadata"],
      filters: { id },
    })

    const order = orders[0]
    if (!order) {
      return res.status(404).json({ message: `Order ${id} not found` })
    }

    // Update metadata with new custom status
    const orderService = req.scope.resolve("order") as any
    const updatedOrder = await orderService.updateOrders({
      selector: { id },
      data: {
        metadata: {
          ...(order.metadata as Record<string, any> || {}),
          custom_status: status,
          custom_status_updated_at: new Date().toISOString(),
        },
      },
    })

    logger.info(
      `[OrderStatus] Order #${order.display_id} (${id}) status updated to "${status}"`
    )

    return res.status(200).json({
      order_id: id,
      display_id: order.display_id,
      custom_status: status,
    })
  } catch (err: any) {
    logger.error(`[OrderStatus] Failed to update order ${id}: ${err.message}`)
    return res.status(500).json({ message: "Failed to update order status" })
  }
}
