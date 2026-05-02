import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { capturePaymentWorkflow } from "@medusajs/core-flows"

/**
 * Mercado Pago IPN (Instant Payment Notification) webhook endpoint.
 *
 * POST /store/webhooks/mercado-pago
 *
 * Mercado Pago sends notifications when payment status changes.
 * This endpoint is idempotent — processing the same notification twice
 * will not create duplicate side effects.
 *
 * On approved payment:
 * - Finds the Medusa order by external_reference
 * - Captures the payment via Medusa workflow
 * - Sets metadata.custom_status to "payment_confirmed"
 *
 * On rejected/cancelled payment:
 * - Sets metadata.custom_status to "cancelled"
 */

// Track processed notifications to ensure idempotency (in-memory; survives restarts via re-processing safely)
const processedNotifications = new Set<string>()

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const logger = req.scope.resolve("logger")

  logger.info(`[MP Webhook] Received: type=${body?.type}, action=${body?.action}`)

  // Validate notification structure
  if (!body?.type || !body?.data?.id) {
    logger.warn("[MP Webhook] Invalid notification structure")
    return res.status(200).json({ received: true }) // Always return 200 to MP
  }

  // Idempotency check
  const notificationKey = `${body.type}_${body.data.id}_${body.action || "unknown"}`
  if (processedNotifications.has(notificationKey)) {
    logger.info(`[MP Webhook] Already processed: ${notificationKey}`)
    return res.status(200).json({ received: true, duplicate: true })
  }

  try {
    if (body.type === "payment") {
      const paymentId = body.data.id
      const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN

      if (!accessToken) {
        logger.warn("[MP Webhook] No MERCADO_PAGO_ACCESS_TOKEN configured")
        return res.status(200).json({ received: true, skipped: true })
      }

      // Fetch payment details from Mercado Pago
      const mpResponse = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      if (!mpResponse.ok) {
        logger.error(`[MP Webhook] Failed to fetch payment ${paymentId}: ${mpResponse.status}`)
        return res.status(200).json({ received: true })
      }

      const payment = await mpResponse.json()

      logger.info(
        `[MP Webhook] Payment ${paymentId}: status=${payment.status}, amount=${payment.transaction_amount}, ref=${payment.external_reference}`
      )

      // TODO: When fully integrated with Medusa payment flow:
      // 1. Find the cart/order by external_reference
      // 2. Update payment status in Medusa
      // 3. Complete the order if payment approved
      // 4. Send confirmation email

      if (payment.status === "approved") {
        logger.info(`[MP Webhook] ✅ Payment approved for ref=${payment.external_reference}`)

        const externalRef = payment.external_reference as string | undefined
        if (externalRef) {
          try {
            const query = req.scope.resolve("query")

            // Find the order by cart_id or order id stored in external_reference
            const { data: orders } = await query.graph({
              entity: "order",
              fields: ["id", "display_id", "metadata", "payment_collections.*", "payment_collections.payments.*"],
              filters: { id: externalRef },
            })

            const order = orders[0]
            if (order) {
              // Capture payment via Medusa workflow
              const paymentCollection = (order as any).payment_collections?.[0]
              const medusaPayment = paymentCollection?.payments?.[0]

              if (medusaPayment?.id) {
                await capturePaymentWorkflow(req.scope).run({
                  input: { payment_id: medusaPayment.id },
                })
                logger.info(`[MP Webhook] 💳 Payment captured for order #${order.display_id}`)
              }

              // Update custom status
              const orderService = req.scope.resolve("order") as any
              await orderService.updateOrders({
                selector: { id: order.id },
                data: {
                  metadata: {
                    ...(order.metadata as Record<string, any> || {}),
                    custom_status: "payment_confirmed",
                    custom_status_updated_at: new Date().toISOString(),
                    mp_payment_id: paymentId,
                  },
                },
              })
              logger.info(`[MP Webhook] 📦 Order #${order.display_id} status set to payment_confirmed`)
            } else {
              logger.warn(`[MP Webhook] Order not found for external_reference=${externalRef}`)
            }
          } catch (err: any) {
            logger.error(`[MP Webhook] Error processing approved payment: ${err.message}`)
          }
        }

        processedNotifications.add(notificationKey)
      } else if (payment.status === "rejected" || payment.status === "cancelled") {
        logger.info(`[MP Webhook] ❌ Payment ${payment.status} for ref=${payment.external_reference}`)

        const externalRef = payment.external_reference as string | undefined
        if (externalRef) {
          try {
            const query = req.scope.resolve("query")
            const { data: orders } = await query.graph({
              entity: "order",
              fields: ["id", "display_id", "metadata"],
              filters: { id: externalRef },
            })
            const order = orders[0]
            if (order) {
              const orderService = req.scope.resolve("order") as any
              await orderService.updateOrders({
                selector: { id: order.id },
                data: {
                  metadata: {
                    ...(order.metadata as Record<string, any> || {}),
                    custom_status: "cancelled",
                    custom_status_updated_at: new Date().toISOString(),
                  },
                },
              })
              logger.info(`[MP Webhook] Order #${order.display_id} status set to cancelled`)
            }
          } catch (err: any) {
            logger.error(`[MP Webhook] Error processing rejected payment: ${err.message}`)
          }
        }

        processedNotifications.add(notificationKey)
      }
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    logger.error(`[MP Webhook] Error: ${error.message}`)
    // Always return 200 so MP doesn't retry excessively
    return res.status(200).json({ received: true, error: true })
  }
}

// Also handle GET for MP webhook verification
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.status(200).json({ status: "ok", provider: "mercado-pago" })
}
