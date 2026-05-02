import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
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
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context } = input

    if (!this.accessToken) {
      // No access token — return a mock session for development
      return {
        id: `dev_session_${Date.now()}`,
        status: "pending" as PaymentSessionStatus,
        data: {
          init_point: "/orden-confirmada",
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
        external_reference: context?.idempotency_key || `order_${Date.now()}`,
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
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          error.message || "Failed to create Mercado Pago preference"
        )
      }

      const data = await response.json()

      return {
        id: data.id as string,
        status: "pending" as PaymentSessionStatus,
        data: {
          init_point: data.init_point,
          sandbox_init_point: data.sandbox_init_point,
        },
      }
    } catch (err: any) {
      if (err instanceof MedusaError) throw err
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        err.message || "Mercado Pago connection error"
      )
    }
  }

  async authorizePayment(
    _input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    return { status: "authorized" as PaymentSessionStatus }
  }

  async capturePayment(
    _input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return {}
  }

  async refundPayment(
    _input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    // TODO: Implement refund via Mercado Pago API when needed
    return {}
  }

  async cancelPayment(
    _input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return {}
  }

  async deletePayment(
    _input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return {}
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const status = (input.data?.status as string) ?? ""
    switch (status) {
      case "approved":
        return { status: "authorized" as PaymentSessionStatus }
      case "rejected":
        return { status: "error" as PaymentSessionStatus }
      case "pending":
      case "in_process":
      default:
        return { status: "pending" as PaymentSessionStatus }
    }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    return { data: input.data }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
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
