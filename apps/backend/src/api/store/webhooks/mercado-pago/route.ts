import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * Mercado Pago IPN (Instant Payment Notification) webhook endpoint.
 *
 * POST /store/webhooks/mercado-pago
 *
 * Mercado Pago sends notifications when payment status changes.
 * This endpoint is idempotent — processing the same notification twice
 * will not create duplicate side effects.
 */

// Track processed notifications to ensure idempotency
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
        // Mark as processed
        processedNotifications.add(notificationKey)
      } else if (payment.status === "rejected") {
        logger.info(`[MP Webhook] ❌ Payment rejected for ref=${payment.external_reference}`)
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
