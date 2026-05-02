const MEDUSA_URL =
  import.meta.env.PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY =
  import.meta.env.PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
}

const CART_ID_KEY = "dani_pastelera_cart_id"

// ─── Cart ID persistence ─────────────────────────────────

export function getCartId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CART_ID_KEY)
}

export function setCartId(id: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_ID_KEY, id)
}

export function clearCartId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_ID_KEY)
}

// ─── Cart types ──────────────────────────────────────────

export type CartLineItem = {
  id: string
  title: string
  variant_id: string
  quantity: number
  unit_price: number
  total: number
  metadata: Record<string, any> | null
  variant: {
    id: string
    title: string
    product: {
      id: string
      title: string
      handle: string
      thumbnail: string | null
    }
  }
}

export type Cart = {
  id: string
  items: CartLineItem[]
  total: number
  subtotal: number
  item_total: number
  region_id: string | null
}

// ─── Cart API calls ──────────────────────────────────────

export async function createCart(regionId?: string): Promise<Cart> {
  const body: any = {}
  if (regionId) body.region_id = regionId
  
  const res = await fetch(`${MEDUSA_URL}/store/carts`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Create cart failed: ${res.status}`)
  const data = await res.json()
  const cart = data.cart
  setCartId(cart.id)
  return cart
}

export async function getCart(cartId: string): Promise<Cart | null> {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}`, { headers })
    if (!res.ok) return null
    const data = await res.json()
    return data.cart
  } catch {
    return null
  }
}

export async function addLineItem(
  cartId: string,
  variantId: string,
  quantity: number,
  metadata?: Record<string, any>
): Promise<Cart> {
  const body: any = {
    variant_id: variantId,
    quantity,
  }
  if (metadata) body.metadata = metadata

  const res = await fetch(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Add line item failed: ${res.status}`)
  }
  const data = await res.json()
  return data.cart
}

export async function updateLineItem(
  cartId: string,
  lineItemId: string,
  quantity: number
): Promise<Cart> {
  const res = await fetch(
    `${MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ quantity }),
    }
  )
  if (!res.ok) throw new Error(`Update line item failed: ${res.status}`)
  const data = await res.json()
  return data.cart
}

export async function removeLineItem(
  cartId: string,
  lineItemId: string
): Promise<Cart> {
  const res = await fetch(
    `${MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`,
    {
      method: "DELETE",
      headers,
    }
  )
  if (!res.ok) throw new Error(`Remove line item failed: ${res.status}`)
  const data = await res.json()
  return data.cart
}

// ─── Helper: ensure cart exists ──────────────────────────

export async function ensureCart(regionId?: string): Promise<Cart> {
  const existingId = getCartId()
  if (existingId) {
    const cart = await getCart(existingId)
    if (cart) return cart
  }
  // Create new cart
  return createCart(regionId)
}
