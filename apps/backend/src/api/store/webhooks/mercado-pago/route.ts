import { createHmac, timingSafeEqual } from "node:crypto"
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import type {
  IOrderModuleService,
  IPaymentModuleService,
  ProviderWebhookPayload,
} from "@medusajs/framework/types"
import { processPaymentWorkflow } from "@medusajs/core-flows"

const MERCADO_PAGO_PROVIDER = "mercado-pago_mercado-pago"

type MercadoPagoWebhook = {
  type?: string
  data?: {
    id?: string | number
  }
}

type MercadoPagoWebhookAction = {
  action: "authorized" | "captured" | "failed" | "pending" | "requires_more" | "canceled" | "not_supported"
  data?: {
    session_id: string
    amount: number
  }
}

type PaymentSession = {
  id: string
  amount: number
  currency_code: string
  payment_collection_id: string
}

type Order = {
  id: string
  metadata: Record<string, unknown> | null
}

function getWebhookSecret(): string {
  return process.env.MERCADO_PAGO_MODE === "production"
    ? process.env.MERCADO_PAGO_PRODUCTION_WEBHOOK_SECRET || ""
    : process.env.MERCADO_PAGO_TEST_WEBHOOK_SECRET || ""
}

function isValidSignature(
  signature: string | undefined,
  requestId: string | undefined,
  paymentId: string,
  secret: string
): boolean {
  if (!signature || !requestId || !secret) {
    return false
  }

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.trim().split("=")
      return [key, value]
    })
  )
  const timestamp = parts.ts
  const receivedHash = parts.v1

  if (!timestamp || !receivedHash) {
    return false
  }

  const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`
  const expectedHash = createHmac("sha256", secret).update(manifest).digest("hex")

  if (receivedHash.length !== expectedHash.length) {
    return false
  }

  return timingSafeEqual(
    Buffer.from(receivedHash, "utf8"),
    Buffer.from(expectedHash, "utf8")
  )
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as MercadoPagoWebhook
  const logger = req.scope.resolve("logger")
  const paymentId = body.data?.id?.toString()

  if (body.type !== "payment" || !paymentId) {
    logger.warn("[MP Webhook] Ignoring unsupported notification")
    return res.status(200).json({ received: true })
  }

  const webhookSecret = getWebhookSecret()
  const signature = req.headers["x-signature"] as string | undefined
  const requestId = req.headers["x-request-id"] as string | undefined

  if (!isValidSignature(signature, requestId, paymentId, webhookSecret)) {
    logger.warn(`[MP Webhook] Invalid signature for payment ${paymentId}`)
    return res.status(401).json({ message: "Invalid Mercado Pago webhook signature" })
  }

  const paymentModule = req.scope.resolve(Modules.PAYMENT) as IPaymentModuleService
  const action = await paymentModule.getWebhookActionAndData(
    {
      provider: MERCADO_PAGO_PROVIDER,
      payload: {
        data: body,
        headers: req.headers,
      },
    } as ProviderWebhookPayload
  ) as MercadoPagoWebhookAction

  if (!action.data || action.action === "not_supported") {
    logger.info(`[MP Webhook] Ignoring payment ${paymentId} with action ${action.action}`)
    return res.status(200).json({ received: true })
  }

  const query = req.scope.resolve("query")
  const { data: sessions } = await query.graph({
    entity: "payment_session",
    fields: ["id", "amount", "currency_code"],
    filters: { id: action.data.session_id },
  })
  const session = sessions[0] as PaymentSession | undefined

  if (!session || session.currency_code.toLowerCase() !== "clp") {
    logger.error(`[MP Webhook] Payment session not found or has invalid currency for ${paymentId}`)
    return res.status(400).json({ message: "Unknown payment session" })
  }

  if (Number(session.amount) !== Number(action.data.amount)) {
    logger.error(`[MP Webhook] Amount mismatch for payment ${paymentId}`)
    return res.status(400).json({ message: "Payment amount mismatch" })
  }

  await processPaymentWorkflow(req.scope).run({
    input: {
      action: action.action,
      data: action.data,
    },
  })

  if (action.action === "captured") {
    const { data: cartLinks } = await query.graph({
      entity: "cart_payment_collection",
      fields: ["cart_id"],
      filters: { payment_collection_id: session.payment_collection_id },
    })
    const cartId = (cartLinks[0] as { cart_id?: string } | undefined)?.cart_id

    if (cartId) {
      const { data: orderLinks } = await query.graph({
        entity: "order_cart",
        fields: ["order_id"],
        filters: { cart_id: cartId },
      })
      const orderId = (orderLinks[0] as { order_id?: string } | undefined)?.order_id

      if (orderId) {
        const { data: orders } = await query.graph({
          entity: "order",
          fields: ["id", "metadata"],
          filters: { id: orderId },
        })
        const order = orders[0] as Order | undefined
        if (order) {
          const orderModule = req.scope.resolve("order") as IOrderModuleService
          await orderModule.updateOrders(order.id, {
            metadata: {
              ...(order.metadata || {}),
              custom_status: "payment_confirmed",
              custom_status_updated_at: new Date().toISOString(),
            },
          })
        }
      }
    }
  }

  logger.info(`[MP Webhook] Processed payment ${paymentId} with action ${action.action}`)
  return res.status(200).json({ received: true })
}

export async function GET(_req: MedusaRequest, res: MedusaResponse) {
  return res.status(200).json({ status: "ok", provider: "mercado-pago" })
}
