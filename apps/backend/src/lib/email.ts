/**
 * Email service — thin wrapper around Resend.
 *
 * Requires env vars:
 *   RESEND_API_KEY  — Resend API key (re_xxxx...)
 *   OWNER_EMAIL     — bakery owner email
 *   FROM_EMAIL      — sending address (must be verified in Resend)
 *
 * If RESEND_API_KEY is not set, email sending is skipped and a warning is
 * logged so local dev still works without credentials.
 */

import { Resend } from "resend"
import type { OrderEmailData } from "../templates/order-confirmation"
import {
  buildOrderConfirmationHtml,
  buildOrderConfirmationText,
} from "../templates/order-confirmation"
import {
  buildOwnerNotificationHtml,
  buildOwnerNotificationText,
} from "../templates/order-notification"

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

/**
 * Sends an order confirmation email to the customer.
 */
export async function sendCustomerConfirmation(
  order: OrderEmailData,
  logger?: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void }
): Promise<void> {
  const resend = getResend()
  if (!resend) {
    logger?.warn("[Email] RESEND_API_KEY not set — skipping customer confirmation email")
    return
  }

  const fromEmail = process.env.FROM_EMAIL || "pedidos@danipastelera.cl"

  try {
    const { error } = await resend.emails.send({
      from: `Dani Pastelera <${fromEmail}>`,
      to: [order.email],
      subject: `✅ Pedido confirmado #${order.display_id} — Dani Pastelera`,
      html: buildOrderConfirmationHtml(order),
      text: buildOrderConfirmationText(order),
    })

    if (error) {
      logger?.error(`[Email] Failed to send customer confirmation for order ${order.display_id}: ${error.message}`)
    } else {
      logger?.info(`[Email] Customer confirmation sent to ${order.email} for order #${order.display_id}`)
    }
  } catch (err: any) {
    logger?.error(`[Email] Unexpected error sending customer confirmation: ${err.message}`)
  }
}

/**
 * Sends a new-order notification email to the bakery owner.
 */
export async function sendOwnerNotification(
  order: OrderEmailData,
  logger?: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void }
): Promise<void> {
  const resend = getResend()
  if (!resend) {
    logger?.warn("[Email] RESEND_API_KEY not set — skipping owner notification email")
    return
  }

  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail) {
    logger?.warn("[Email] OWNER_EMAIL not set — skipping owner notification email")
    return
  }

  const fromEmail = process.env.FROM_EMAIL || "pedidos@danipastelera.cl"

  try {
    const { error } = await resend.emails.send({
      from: `Dani Pastelera <${fromEmail}>`,
      to: [ownerEmail],
      subject: `🔔 Nuevo pedido #${order.display_id} — ${order.email}`,
      html: buildOwnerNotificationHtml(order),
      text: buildOwnerNotificationText(order),
    })

    if (error) {
      logger?.error(`[Email] Failed to send owner notification for order ${order.display_id}: ${error.message}`)
    } else {
      logger?.info(`[Email] Owner notification sent for order #${order.display_id}`)
    }
  } catch (err: any) {
    logger?.error(`[Email] Unexpected error sending owner notification: ${err.message}`)
  }
}
