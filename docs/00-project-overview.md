# Dani Pastelera — Project Overview

## 1. Project Summary

Dani Pastelera is a boutique ecommerce platform for an artisanal bakery focused on healthy, inclusive, and highly customizable pastry products.

The store specializes in:

- Gluten-free pastry for celiac customers.
- Sugar-free pastry suitable for diabetic customers.
- Vegan pastry products.
- A smaller secondary line of traditional pastry products.

The expected catalog size is small, approximately 50 products, but each product may be highly configurable. Product configuration can affect price, preparation time, available options, and order details.

This is not a generic ecommerce project. The most important part of the platform is the customer experience for configuring pastry products in a clear, warm, and intuitive way.

---

## 2. Business Goals

The main business goals are:

- Allow customers to buy customized pastry products online.
- Reduce manual order coordination through WhatsApp.
- Make dietary options clear and trustworthy.
- Allow customers to configure products without confusion.
- Automate payment collection using Mercado Pago.
- Provide a manageable admin experience for the bakery owner.
- Keep infrastructure simple and affordable.
- Build a technical foundation that can grow later without rebuilding the whole system.

---

## 3. Target Customers

The ecommerce should serve customers looking for:

- Birthday cakes.
- Healthy desserts.
- Gluten-free pastry.
- Sugar-free pastry.
- Vegan cakes and desserts.
- Small event pastry.
- Gift boxes.
- Special occasion products.

Customers may not be technical users, so the experience must be extremely clear, visual, and mobile-friendly.

---

## 4. Brand and Product Philosophy

The store should feel:

- Warm.
- Homemade.
- Trustworthy.
- Clean.
- Healthy.
- Premium but accessible.
- Family-oriented.
- Easy to use.

Product photos should be the main visual element. The design should support the products instead of competing with them.

---

## 5. Catalog Scope

The initial catalog should support up to 50 products.

Product examples:

- Healthy cakes.
- Gluten-free cakes.
- Sugar-free cakes.
- Vegan cakes.
- Cupcakes.
- Brownies.
- Cookies.
- Dessert boxes.
- Seasonal products.
- Traditional pastry products.

Recommended high-level categories:

- Sin Gluten
- Sin Azúcar
- Vegano
- Tortas
- Brownies
- Galletas
- Cupcakes
- Cajas de Regalo
- Tradicional

Recommended dietary tags:

- Sin gluten
- Sin azúcar
- Vegano
- Sin lactosa
- Apto celíacos
- Apto diabéticos
- Bajo en carbohidratos
- Contiene frutos secos
- Contiene huevo
- Contiene lácteos

---

## 6. Key Functional Requirements

The platform must include:

- Home page.
- Product listing pages.
- Product detail pages.
- Product configurator.
- Dynamic pricing based on selected options.
- Cart.
- Checkout.
- Customer information form.
- Delivery or pickup information.
- Mercado Pago payment integration.
- Order confirmation page.
- Order management in admin.
- Product image management.
- Basic SEO.
- Mobile-first responsive design.

---

## 7. Language Strategy

The ecommerce must support both Spanish and English from the beginning.

Spanish is the default and primary language.

English is a secondary language intended for future growth, English-speaking customers, tourists, or bilingual users.

The codebase, internal services, variables, functions, components, database fields, and technical documentation should be written in English.

All customer-facing content must be translatable.

This includes:

- Navigation.
- Product names.
- Product descriptions.
- Product categories.
- Dietary labels.
- Product configurator.
- Cart.
- Checkout.
- Payment messages.
- Order confirmation.
- Emails.
- Error messages.
- SEO metadata.

The storefront must not hardcode customer-facing text directly inside UI components. It should use centralized translation files or an i18n structure.

Spanish should be the fallback language when English content is missing.

---

## 8. Technical Direction

Recommended stack:

- Medusa.js v2 for ecommerce backend.
- Astro for storefront frontend.
- React components only for interactive UI sections.
- PostgreSQL as main database.
- Redis for jobs, cache, and background processing.
- Railway as main hosting platform.
- Cloudflare R2 or similar object storage for product images.
- Mercado Pago as payment provider.
- GitHub as source control.

The system should be built as a modern headless ecommerce architecture.

---

## 9. MVP Scope

The MVP should include:

- Home page.
- Category pages.
- Product detail pages.
- Product configurator.
- Dynamic pricing.
- Cart.
- Checkout.
- Mercado Pago integration.
- Order confirmation.
- Admin product management.
- Admin order management.
- Basic email notifications.
- Railway deployment.

The MVP should not initially include:

- Loyalty program.
- Subscriptions.
- Multi-vendor marketplace.
- Complex ERP integration.
- Advanced CRM.
- Mobile app.
- Advanced AI recommendations.
- Multi-country support.

---

## 10. Success Criteria

The project should be considered successful if:

- Customers can configure and buy products easily from mobile.
- The owner can manage products and orders without technical support.
- Prices are calculated correctly.
- Mercado Pago payments are confirmed reliably.
- Orders store all customization details clearly.
- The design feels warm, trustworthy, and professional.
- The system can run with low monthly infrastructure cost.
- The technical foundation allows future expansion.
