# Dani Pastelera — Railway Infrastructure

## 1. Infrastructure Goal

The goal is to keep infrastructure simple, affordable, and easy to operate.

The first production version should run primarily on Railway.

Railway should host:

- Medusa backend.
- Medusa worker.
- Astro storefront.
- PostgreSQL.
- Redis.

External services:

- Cloudflare R2 for media storage.
- Mercado Pago for payments.
- GitHub for source control.
- Optional email provider.
- Optional analytics provider.

---

## 2. Railway Project Structure

Recommended Railway project:

```txt
Railway Project: dani-pastelera

Services:
- storefront-astro
- medusa-backend
- medusa-worker
- postgres
- redis
```

---

## 3. Service Responsibilities

### storefront-astro

Responsible for:

- Public website.
- Product listing.
- Product detail pages.
- Product configurator UI.
- Cart UI.
- Checkout UI.
- Language routing.
- SEO metadata.
- Static assets.

### medusa-backend

Responsible for:

- Store API.
- Admin API.
- Product catalog.
- Cart.
- Checkout.
- Orders.
- Customers.
- Mercado Pago payment provider.
- Webhook endpoints.
- Custom modules.

### medusa-worker

Responsible for:

- Background jobs.
- Event processing.
- Payment confirmation side effects.
- Notification jobs.
- Future async tasks.

### postgres

Responsible for:

- Persistent ecommerce data.
- Products.
- Orders.
- Customers.
- Carts.
- Payments.
- Custom metadata.

### redis

Responsible for:

- Job processing.
- Event bus.
- Cache.
- Background processing support.

---

## 4. Environment Variables

### Backend

```env
NODE_ENV=production
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
COOKIE_SECRET=

MEDUSA_BACKEND_URL=
STORE_CORS=
ADMIN_CORS=
AUTH_CORS=

MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

### Storefront

```env
PUBLIC_SITE_URL=
PUBLIC_MEDUSA_BACKEND_URL=
PUBLIC_DEFAULT_LOCALE=es
PUBLIC_SUPPORTED_LOCALES=es,en
PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
```

---

## 5. Deployment Strategy

Use GitHub as the source of truth.

Recommended flow:

```txt
Developer pushes to GitHub
  ↓
Railway detects changes
  ↓
Railway builds affected service
  ↓
Railway deploys service
```

Recommended branches:

```txt
main        Production
develop     Staging / integration branch
feature/*   Feature work
```

For MVP, a single production environment may be enough, but the codebase should be prepared for staging.

---

## 6. Service Commands

Example backend commands:

```txt
Build:
npm run build

Start backend:
npm run start

Start worker:
npm run worker
```

Example storefront commands:

```txt
Build:
npm run build

Start:
npm run preview -- --host 0.0.0.0 --port $PORT
```

Exact commands may change based on the final project setup.

---

## 7. Storage Strategy

Do not store product images in the application filesystem.

Use Cloudflare R2 or similar object storage.

Reasons:

- Better reliability.
- Easier CDN integration.
- Avoid losing files during deployments.
- Better performance for image-heavy ecommerce.
- Easier future migration.

Recommended media usage:

```txt
Product images → Cloudflare R2
Public delivery → R2 public URL or CDN
Product image metadata → Medusa/PostgreSQL
```

---

## 8. Cost Strategy

Expected MVP monthly cost:

```txt
Railway: approx. 10–25 USD/month
Cloudflare R2: very low for small catalog
Mercado Pago: transaction fees
Domain: annual cost
Email provider: optional
```

Cost control recommendations:

- Configure Railway spending alerts.
- Avoid oversized services.
- Monitor memory usage.
- Keep images optimized.
- Avoid unnecessary background jobs.
- Use caching carefully.

---

## 9. Observability

Minimum observability:

- Railway logs.
- Backend healthcheck endpoint.
- Storefront healthcheck page or route.
- Payment webhook logs.
- Order creation logs.
- Error logging for checkout failures.

Recommended future observability:

- Sentry for frontend/backend errors.
- Uptime monitoring.
- Basic analytics.
- Mercado Pago webhook audit trail.

---

## 10. Production Readiness Checklist

Before launch:

- Railway services deployed.
- Database migrations applied.
- Redis connected.
- Storefront connected to backend.
- Mercado Pago sandbox tested.
- Mercado Pago production credentials configured.
- Webhook endpoint publicly accessible.
- Domain configured.
- SSL enabled.
- Product images served from object storage.
- Admin user created.
- Test order completed.
- Failed payment scenario tested.
- Order confirmation tested.
- Mobile checkout tested.
