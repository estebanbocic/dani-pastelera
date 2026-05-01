# Dani Pastelera — Checkout and Payments

## 1. Checkout Goal

The checkout must be simple, trustworthy, and optimized for mobile.

The customer should be able to:

- Review configured products.
- Enter personal information.
- Choose delivery or pickup.
- Select date/time if available.
- Pay with Mercado Pago.
- Receive confirmation.

The checkout should avoid unnecessary friction.

---

## 2. Checkout Flow

Recommended flow:

```txt
Cart
  ↓
Customer information
  ↓
Delivery or pickup
  ↓
Delivery date / time window
  ↓
Order summary
  ↓
Mercado Pago payment
  ↓
Order confirmation
```

---

## 3. Customer Data

Required fields:

```txt
Name
Email
Phone / WhatsApp
Delivery or pickup option
Address, if delivery
Commune / city
Delivery date
Delivery time window, if enabled
Order notes
```

Optional fields:

```txt
Company name
Gift message
Recipient name
Recipient phone
```

Do not require account creation for MVP.

---

## 4. Delivery and Pickup

The system must support:

- Pickup.
- Local delivery.

For MVP, delivery rules can be simple.

Possible delivery fields:

```ts
type DeliveryInfo = {
  method: "pickup" | "delivery"
  address?: string
  commune?: string
  notes?: string
  date: string
  timeWindow?: string
}
```

Future delivery improvements:

- Delivery zones.
- Delivery pricing by commune.
- Daily production capacity.
- Blocked dates.
- Minimum preparation time.
- Holiday schedules.

---

## 5. Mercado Pago Integration

Mercado Pago should be implemented as a custom Medusa payment provider or integration module.

Recommended payment flow:

```txt
Customer completes checkout data
  ↓
Medusa validates cart and pricing
  ↓
Backend creates Mercado Pago preference
  ↓
Frontend redirects customer to Mercado Pago
  ↓
Customer pays
  ↓
Mercado Pago sends webhook
  ↓
Backend verifies payment
  ↓
Order is marked as paid
  ↓
Confirmation is shown/sent
```

---

## 6. Payment States

Support these payment states:

```txt
pending
authorized
captured
failed
cancelled
refunded
```

Order should only move to confirmed/paid state after reliable payment confirmation.

---

## 7. Webhook Requirements

The Mercado Pago webhook endpoint must:

- Be public.
- Verify payload authenticity if possible.
- Fetch payment details from Mercado Pago if needed.
- Match payment to cart/order.
- Update payment status.
- Avoid duplicated processing.
- Be idempotent.

Idempotency is critical because webhooks may be retried.

Recommended idempotency key:

```txt
provider_transaction_id + event_type
```

---

## 8. Order Confirmation

Order confirmation page must show:

- Order number.
- Customer name.
- Payment status.
- Ordered products.
- Selected configurations.
- Delivery/pickup information.
- Total paid.
- Next steps.

Spanish copy example:

```txt
¡Gracias por tu pedido!
Recibimos tu compra y comenzaremos a prepararla según la fecha seleccionada.
```

English:

```txt
Thank you for your order!
We received your purchase and will prepare it according to the selected date.
```

---

## 9. Email Notifications

MVP email notifications:

- Order received.
- Payment confirmed.
- Order ready for pickup.
- Order delivered/cancelled, optional.

Emails must be bilingual-ready.

Spanish is the default.

---

## 10. Security Rules

Payment security rules:

- Never trust frontend totals.
- Calculate final price in backend.
- Validate cart before creating payment.
- Use environment variables for Mercado Pago credentials.
- Do not expose private access tokens to frontend.
- Use HTTPS.
- Verify webhooks.
- Log payment state changes.

---

## 11. Testing Scenarios

Test before launch:

- Successful payment.
- Failed payment.
- Cancelled payment.
- Pending payment.
- Webhook retry.
- Duplicate webhook.
- Cart total mismatch.
- Invalid configuration.
- Mobile checkout.
- Order confirmation.
- Admin order visibility.

---

## 12. AI Agent Instructions

When implementing checkout:

- Keep checkout short.
- Do not require user account.
- Treat backend as pricing authority.
- Make payment webhook idempotent.
- Store all product customizations in the final order.
- Keep Spanish and English copy centralized.
- Make the failure states clear and friendly.
