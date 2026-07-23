import { AbstractPaymentProvider, MedusaError } from "@medusajs/framework/utils"
import {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  PaymentSessionStatus,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"

type MercadoPagoMode = "test" | "production"

type MercadoPagoOptions = {
  mode: MercadoPagoMode
  testAccessToken?: string
  productionAccessToken?: string
}

type MercadoPagoPayment = {
  id: number
  status: string
  transaction_amount: number
  currency_id: string
  external_reference?: string
}

type MercadoPagoPaymentSearch = {
  results?: MercadoPagoPayment[]
}

type MercadoPagoPreference = {
  id: string
  init_point?: string
  sandbox_init_point?: string
}

class MercadoPagoProviderService extends AbstractPaymentProvider<MercadoPagoOptions> {
  static identifier = "mercado-pago"

  private readonly accessToken: string
  private readonly mode: MercadoPagoMode
  private readonly baseUrl = "https://api.mercadopago.com"

  constructor(container: Record<string, unknown>, options: MercadoPagoOptions) {
    super(container, options)
    this.mode = options.mode
    this.accessToken =
      this.mode === "production"
        ? options.productionAccessToken || ""
        : options.testAccessToken || ""
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    const sessionId = input.data?.session_id

    if (!this.accessToken) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Mercado Pago ${this.mode} credentials are not configured`
      )
    }

    if (!sessionId || typeof sessionId !== "string") {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Mercado Pago payment session ID is missing"
      )
    }

    const amount = Number(input.amount)
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Mercado Pago requires a positive integer CLP amount"
      )
    }

    const storefrontUrl = this.getStorefrontUrl()
    const backUrls = {
      success: `${storefrontUrl}/orden-confirmada?status=approved`,
      failure: `${storefrontUrl}/orden-confirmada?status=failed`,
      pending: `${storefrontUrl}/orden-confirmada?status=pending`,
    }
    const preference = {
      items: [
        {
          title: "Pedido Dani Pastelera",
          quantity: 1,
          unit_price: amount,
          currency_id: input.currency_code.toUpperCase(),
        },
      ],
      back_urls: backUrls,
      ...(this.supportsAutoReturn(storefrontUrl) ? { auto_return: "approved" } : {}),
      external_reference: sessionId,
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
      const error = (await response.json()) as { message?: string }
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        error.message || "Failed to create Mercado Pago preference"
      )
    }

    const data = (await response.json()) as MercadoPagoPreference
    const checkoutUrl =
      this.mode === "production" ? data.init_point : data.sandbox_init_point

    if (!checkoutUrl) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Mercado Pago did not return a ${this.mode} checkout URL`
      )
    }

    return {
      id: data.id,
      status: "pending" as PaymentSessionStatus,
      data: {
        id: data.id,
        preference_id: data.id,
        session_id: sessionId,
        external_reference: sessionId,
        amount,
        currency_code: input.currency_code.toUpperCase(),
        checkout_url: checkoutUrl,
        mode: this.mode,
      },
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const status = await this.getPaymentStatus(input)
    return { status: status.status, data: input.data }
  }

  async capturePayment(_input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return {}
  }

  async refundPayment(_input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Mercado Pago refunds must be processed from the Mercado Pago dashboard"
    )
  }

  async cancelPayment(_input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {}
  }

  async deletePayment(_input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {}
  }

  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const paymentId = input.data?.payment_id
    const externalReference = input.data?.external_reference
    const payment =
      typeof paymentId === "string"
        ? await this.retrieveMercadoPagoPayment(paymentId)
        : typeof externalReference === "string"
          ? await this.findPaymentByExternalReference(externalReference)
          : undefined

    if (!payment) {
      return { status: "pending" as PaymentSessionStatus }
    }

    return { status: this.toPaymentSessionStatus(payment.status) }
  }

  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return { data: input.data, status: "pending" as PaymentSessionStatus }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    return { data: input.data }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const body = payload.data as {
      type?: string
      data?: { id?: string }
    }

    if (body.type !== "payment" || !body.data?.id) {
      return { action: "not_supported" }
    }

    const payment = await this.retrieveMercadoPagoPayment(body.data.id)
    if (!payment.external_reference) {
      return { action: "not_supported" }
    }

    const action = this.toWebhookAction(payment.status)
    if (action === "not_supported") {
      return { action }
    }

    return {
      action,
      data: {
        session_id: payment.external_reference,
        amount: payment.transaction_amount,
      },
    }
  }

  private toPaymentSessionStatus(status: string): PaymentSessionStatus {
    switch (status) {
      case "approved":
        return "authorized" as PaymentSessionStatus
      case "rejected":
      case "cancelled":
        return "error" as PaymentSessionStatus
      default:
        return "pending" as PaymentSessionStatus
    }
  }

  private toWebhookAction(status: string): WebhookActionResult["action"] {
    switch (status) {
      case "approved":
        return "captured"
      case "rejected":
        return "failed"
      case "cancelled":
        return "canceled"
      case "pending":
      case "in_process":
        return "pending"
      default:
        return "not_supported"
    }
  }

  private async retrieveMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
    if (!this.accessToken) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Mercado Pago ${this.mode} credentials are not configured`
      )
    }

    const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    })

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Mercado Pago payment lookup failed: ${response.status}`
      )
    }

    return (await response.json()) as MercadoPagoPayment
  }

  private getStorefrontUrl(): string {
    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:4321"

    if (!URL.canParse(storefrontUrl) || storefrontUrl.includes(",")) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "STOREFRONT_URL must contain one valid storefront URL"
      )
    }

    return storefrontUrl.replace(/\/$/, "")
  }

  private supportsAutoReturn(storefrontUrl: string): boolean {
    const parsedUrl = new URL(storefrontUrl)
    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname !== "localhost" &&
      parsedUrl.hostname !== "127.0.0.1"
    )
  }

  private async findPaymentByExternalReference(
    externalReference: string
  ): Promise<MercadoPagoPayment | undefined> {
    if (!this.accessToken) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Mercado Pago ${this.mode} credentials are not configured`
      )
    }

    const response = await fetch(
      `${this.baseUrl}/v1/payments/search?external_reference=${encodeURIComponent(externalReference)}`,
      { headers: { Authorization: `Bearer ${this.accessToken}` } }
    )

    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Mercado Pago payment search failed: ${response.status}`
      )
    }

    const data = (await response.json()) as MercadoPagoPaymentSearch
    return data.results?.[0]
  }
}

export default MercadoPagoProviderService
