# Guía de Operaciones — Dani Pastelera

Guía para gestionar pedidos y operar la tienda desde el panel de administración.

---

## 1. Acceso al Panel Admin

- **URL:** http://localhost:9000/app (desarrollo) o https://tu-dominio.railway.app/app (producción)
- **Email:** admin@danipastelera.cl
- **Contraseña:** (configurada en producción)

---

## 2. Ver Pedidos

1. En el menú lateral, haz clic en **Orders** (Pedidos).
2. Verás la lista de todos los pedidos ordenados por fecha.
3. Haz clic en un pedido para ver sus detalles.

### Qué muestra la página de detalle

Cada pedido tiene tres secciones principales (en orden):

**Estado del pedido** — aparece primero, muestra el estado actual y los botones para avanzarlo.

**Detalles de Personalización** — muestra cada producto con:
- Las opciones seleccionadas por el cliente (relleno, cobertura, decoración, mensaje, etc.)
- El perfil dietario (sin gluten, vegano, sin azúcar, etc.)
- Los alérgenos presentes
- El desglose de precios

**Información de Entrega** — método (retiro o delivery), fecha, dirección y notas del cliente.

---

## 3. Estados del Pedido

Los pedidos tienen un estado operacional propio. Los estados posibles son:

| Estado | Significado |
|--------|-------------|
| **Nuevo** | Pedido recibido, aún sin confirmación de pago |
| **Pago pendiente** | El cliente está procesando el pago |
| **Pago confirmado** | El pago fue aprobado por Mercado Pago |
| **En preparación** | Estás preparando el pedido en la cocina |
| **Listo para retiro** | El pedido está listo, esperando que el cliente pase a buscarlo |
| **En reparto** | El pedido salió a domicilio |
| **Entregado** | El pedido fue entregado o retirado exitosamente |
| **Cancelado** | El pedido fue cancelado |

### Flujo normal de producción

```
Nuevo → Pago confirmado → En preparación → Listo para retiro → Entregado
                                         ↘ En reparto ↗
```

### Cómo avanzar el estado

En la página de detalle del pedido:

1. El **botón azul** avanza el pedido al siguiente estado lógico (ej: "→ En preparación").
2. Si el pedido sale a domicilio en lugar de retiro, usa el botón secundario "→ En reparto".
3. El botón **Cancelar** cancela el pedido desde cualquier estado.
4. El menú **"Cambiar estado ▾"** permite saltar a cualquier estado si es necesario.

> El pago generalmente se confirma automáticamente vía webhook de Mercado Pago. Solo necesitas avanzar manualmente desde "Pago confirmado" en adelante.

---

## 4. Emails Automáticos

El sistema envía emails automáticamente en estos momentos:

| Evento | Destinatario | Contenido |
|--------|-------------|-----------|
| Pedido creado | **Cliente** | Confirmación con número de pedido, productos, customizaciones, fecha de entrega y total |
| Pedido creado | **Dueña (tú)** | Alerta operacional con los productos a preparar, alérgenos, opciones seleccionadas y datos de entrega |

> Los emails se envían vía **Resend**. Requiere configurar `RESEND_API_KEY`, `OWNER_EMAIL` y `FROM_EMAIL` en las variables de entorno.

---

## 5. Verificar Customizaciones

Cada pedido muestra las customizaciones seleccionadas de forma legible. Nunca necesitas abrir el JSON raw.

**Ejemplo de lo que verás:**

```
Torta Brownie Saludable — 10 porciones
Cantidad: 1

Relleno:          Manjar
Cobertura:        Chocolate bitter
Decoración:       Flores comestibles
Mensaje:          "Feliz cumpleaños Marta! 🎂"
Fecha de entrega: 2025-06-15

⚠️ Sin gluten  🌿 Vegano

Alérgenos: Frutos secos, Almendras

Precio base:       $28.000
+ Flores especiales: +$3.000
Total:             $31.000
```

---

## 6. Checklist Diario

Cada mañana:
1. Revisar pedidos con fecha de entrega del día actual.
2. Confirmar que los estados estén en **Pago confirmado** antes de empezar a preparar.
3. Avanzar cada pedido a **En preparación** cuando comienzas a prepararlo.
4. Avanzar a **Listo para retiro** o **En reparto** cuando esté listo.
5. Marcar como **Entregado** cuando el cliente lo reciba.

---

## 7. Configuración de Emails (primera vez)

Para activar los emails:

1. Crear cuenta gratuita en [resend.com](https://resend.com)
2. Verificar el dominio `danipastelera.cl`
3. Crear una API key
4. Agregar estas variables de entorno en Railway:
   - `RESEND_API_KEY=re_xxxxxxxxxxxx`
   - `OWNER_EMAIL=dani@danipastelera.cl`
   - `FROM_EMAIL=pedidos@danipastelera.cl`

Sin estas variables, el sistema funciona normalmente pero no envía emails (solo registra un aviso en los logs).

---

## 8. Configuración de Mercado Pago

La tienda usa Checkout Pro hospedado. El cliente se redirige a Mercado Pago y el pedido
solo se crea después de que un webhook firmado confirma el pago.

### Modo de pruebas

Configura estas variables en el backend local o de pruebas:

```txt
MERCADO_PAGO_MODE=test
MERCADO_PAGO_TEST_ACCESS_TOKEN=<token-de-prueba>
MERCADO_PAGO_TEST_WEBHOOK_SECRET=<secret-de-firma>
```

El modo de pruebas usa `sandbox_init_point`. Usa únicamente las tarjetas de prueba de
Mercado Pago; nunca tarjetas reales. Expón `POST /store/webhooks/mercado-pago` mediante
una URL HTTPS pública y configura esa URL en Mercado Pago para recibir notificaciones.

### Modo de producción

En Railway, configura:

```txt
MERCADO_PAGO_MODE=production
MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN=<token-de-produccion>
MERCADO_PAGO_PRODUCTION_WEBHOOK_SECRET=<secret-de-firma>
MEDUSA_BACKEND_URL=https://api.danipastelera.cl
STORE_CORS=https://danipastelera.cl
```

Activa las credenciales de producción en Mercado Pago y registra el evento `payment`
para la URL pública `https://api.danipastelera.cl/store/webhooks/mercado-pago`.
Las credenciales y secretos son exclusivos del backend; no se agregan al storefront.

Después de desplegar, ejecuta una compra de prueba y confirma que el pedido aparece
con pago confirmado antes de prepararlo.
