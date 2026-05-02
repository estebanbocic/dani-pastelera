import { AbstractPaymentProvider } from "@medusajs/framework/utils"
import {
  CreatePaymentProviderSession,
  UpdatePaymentProviderSession,
  PaymentProviderError,
  PaymentProviderSessionResponse,
  PaymentSessionStatus,
  ProviderWebhookPayload,
  WebhookActionResult,
} from "@medusajs/framework/types"

/**
 * Mercado Pago Payment Provider for Dani Pastelera
 *
 * Environment variables:
 * - MERCADO_PAGO_ACCESS_TOKEN: sandbox or production access token
 * - MERCADO_PAGO_WEBHOOK_SECRET: webhook verification secret (optional)
 *
 * Switch sandbox/production by changing the access token env var value.
 */

type MercadoPagoOptions = {
  accessToken?: string
  webhookSecret?: string
}

class MercadoPagoProviderService extends AbstractPaymentProvider<MercadoPagoOptions> {
  static identifier = "mercado-pago"

  private accessToken: string
  private webhookSecret: string
  private baseUrl = "https://api.mercadopago.com"

  constructor(container: any, options: MercadoPagoOptions) {
    super(container, options)
    this.accessToken = options.accessToken || process.env.MERCADO_PAGO_ACCESS_TOKEN || ""
    this.webhookSecret = options.webhookSecret || process.env.MERCADO_PAGO_WEBHOOK_SECRET || ""
  }

  /**
   * Create a payment session — called when customer initiates checkout.
   * Creates a Mercado Pago preference and returns the init_point URL.
   */
  async initiatePayment(
    input: CreatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const { amount, currency_code, context } = input

    if (!this.accessToken) {
      // If no access token configured, return a mock session for development
      return {
        data: {
          id: `dev_session_${Date.now()}`,
          status: "pending",
          init_point: "/orden-confirmada", // Redirect to confirmation in dev
          sandbox_init_point: "/orden-confirmada",
          _dev_mode: true,
        },
      }
    }

    try {
      // Create Mercado Pago preference
      const preference = {
        items: [
          {
            title: "Pedido Dani Pastelera",
            quantity: 1,
            unit_price: amount,
            currency_id: currency_code?.toUpperCase() || "CLP",
          },
        ],
        back_urls: {
          success: `${process.env.STORE_CORS || "http://localhost:4321"}/orden-confirmada?status=approved`,
          failure: `${process.env.STORE_CORS || "http://localhost:4321"}/checkout?status=failed`,
          pending: `${process.env.STORE_CORS || "http://localhost:4321"}/checkout?status=pending`,
        },
        auto_return: "approved",
        external_reference: context?.session_id || `order_${Date.now()}`,
        notification_url: `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/webhooks/mercado-pago`,
      }

      const response = await fetch(`${this.baseUrl}/checkout/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify(preference),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          error: error.message || "Failed to create Mercado Pago preference",
          code: String(response.status),
          detail: JSON.stringify(error),
        }
      }

      const data = await response.json()

      return {
        data: {
          id: data.id,
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point,
          status: "pending",
        },
      }
    } catch (err: any) {
      return {
        error: err.message || "Mercado Pago connection error",
        code: "MP_ERROR",
        detail: err.message,
      }
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: Record<string, unknown> }> {
    return {
      status: "authorized" as PaymentSessionStatus,
      data: paymentSessionData,
    }
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return paymentSessionData
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    // TODO: Implement refund via Mercado Pago API when needed
    return paymentSessionData
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return paymentSessionData
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return paymentSessionData
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    const status = paymentSessionData.status as string
    switch (status) {
      case "approved":
        return "authorized" as PaymentSessionStatus
      case "pending":
      case "in_process":
        return "pending" as PaymentSessionStatus
      case "rejected":
        return "error" as PaymentSessionStatus
      default:
        return "pending" as PaymentSessionStatus
    }
  }

  async updatePayment(
    input: UpdatePaymentProviderSession
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    return { data: input.data }
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | Record<string, unknown>> {
    return paymentSessionData
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload
  ): Promise<WebhookActionResult> {
    const body = payload.data as any

    // Mercado Pago IPN notification
    if (body?.type === "payment" && body?.data?.id) {
      try {
        // Fetch payment details from Mercado Pago
        const response = await fetch(
          `${this.baseUrl}/v1/payments/${body.data.id}`,
          {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          }
        )

        if (!response.ok) {
          return { action: "not_supported" }
        }

        const payment = await response.json()

        if (payment.status === "approved") {
          return {
            action: "authorized",
            data: {
              session_id: payment.external_reference,
              amount: payment.transaction_amount,
            },
          }
        }
      } catch {
        // Log error but don't crash
      }
    }

    return { action: "not_supported" }
  }
}

export default MercadoPagoProviderService
