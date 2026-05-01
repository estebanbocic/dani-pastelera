# Dani Pastelera — Admin and Operations

## 1. Admin Goal

The admin experience must allow the bakery owner to operate the business without technical support.

The owner should be able to:

- Manage products.
- Manage prices.
- Manage images.
- Review orders.
- See product customizations.
- Update order statuses.
- Prepare daily production.
- Understand customer delivery/pickup details.

---

## 2. Admin Users

Initial admin roles:

```txt
Owner
Operator
Developer
```

MVP can start with one admin user, but role separation should be considered later.

---

## 3. Product Management

The admin should support:

- Product name.
- Product description.
- Product images.
- Product categories.
- Dietary tags.
- Allergen tags.
- Product variants.
- Base prices.
- Active/inactive status.
- Preparation time.
- Configurable options.

For bilingual support, product content should support Spanish and English.

Spanish is required. English can be optional.

---

## 4. Order Management

The admin must clearly show:

- Order number.
- Customer information.
- Payment status.
- Delivery or pickup method.
- Delivery date.
- Products ordered.
- Selected product configuration.
- Price breakdown.
- Customer notes.
- Internal notes.
- Order status.

Selected product customizations must be visible without inspecting raw JSON.

---

## 5. Order Statuses

Recommended custom order statuses:

```txt
Nuevo
Pago pendiente
Pago confirmado
En preparación
Listo para retiro
En reparto
Entregado
Cancelado
```

English internal equivalents:

```txt
new
payment_pending
payment_confirmed
in_preparation
ready_for_pickup
out_for_delivery
delivered
cancelled
```

---

## 6. Production Workflow

Recommended operational workflow:

```txt
1. New order arrives.
2. Payment is confirmed.
3. Owner reviews customization details.
4. Order moves to "En preparación".
5. Order is prepared.
6. Order moves to "Listo para retiro" or "En reparto".
7. Order is delivered/picked up.
8. Order moves to "Entregado".
```

---

## 7. Daily Production View

Future useful feature:

```txt
Production Dashboard
```

It should show:

- Orders by delivery date.
- Products to prepare.
- Quantities.
- Dietary requirements.
- Allergens.
- Special messages.
- Pickup/delivery schedule.

This may be a custom admin page later.

---

## 8. Notifications

MVP notifications:

- Email to customer after order.
- Email to owner after order.
- Optional manual WhatsApp link.

Future notifications:

- Automatic WhatsApp message.
- Order status updates.
- Delivery reminders.
- Payment confirmation messages.

---

## 9. Operational Risks

Important risks:

- Wrong product configuration.
- Missing delivery date.
- Incorrect price calculation.
- Payment confirmed but order not updated.
- Allergens not clearly communicated.
- Owner cannot understand selected options.
- Customer expects impossible delivery date.

Mitigation:

- Strong validation.
- Clear admin display.
- Required delivery date.
- Preparation time rules.
- Payment webhook logging.
- Clear allergen labels.
- Order confirmation details.

---

## 10. Reports

MVP can start without advanced reporting.

Useful future reports:

- Sales by product.
- Sales by category.
- Best-selling dietary profile.
- Orders by commune.
- Average order value.
- Monthly revenue.
- Cancelled orders.
- Most selected fillings/extras.

---

## 11. AI Agent Instructions

When implementing admin/operations:

- Make order customization details human-readable.
- Do not expose raw metadata as the only view.
- Keep order statuses clear.
- Store enough data to prepare the order correctly.
- Prioritize owner usability over technical purity.
- Keep Spanish labels for admin-facing operational text.
- Keep internal code/status keys in English.
