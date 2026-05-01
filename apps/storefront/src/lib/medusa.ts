const MEDUSA_URL =
  import.meta.env.PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY =
  import.meta.env.PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const headers: Record<string, string> = {
  "Content-Type": "application/json",
  ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
}

async function medusaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${MEDUSA_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  })
  if (!res.ok) {
    throw new Error(`Medusa API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ─── Products ─────────────────────────────────────────────

export type MedusaProduct = {
  id: string
  title: string
  handle: string
  description: string | null
  metadata: Record<string, any> | null
  categories: { id: string; name: string; handle: string }[]
  variants: MedusaVariant[]
  images: { id: string; url: string }[]
  thumbnail: string | null
  status: string
}

export type MedusaVariant = {
  id: string
  title: string
  sku: string | null
  metadata: Record<string, any> | null
  calculated_price?: {
    calculated_amount: number
    currency_code: string
  }
  prices: { amount: number; currency_code: string }[]
}

export type MedusaCategory = {
  id: string
  name: string
  handle: string
  description: string | null
  parent_category: MedusaCategory | null
  category_children: MedusaCategory[]
}

export async function getProducts(params?: {
  category_id?: string[]
  limit?: number
  offset?: number
}): Promise<{ products: MedusaProduct[]; count: number }> {
  const query = new URLSearchParams()
  if (params?.limit) query.set("limit", String(params.limit))
  if (params?.offset) query.set("offset", String(params.offset))
  if (params?.category_id) {
    for (const id of params.category_id) {
      query.append("category_id[]", id)
    }
  }
  query.set("fields", "+metadata,*categories")
  const qs = query.toString() ? `?${query.toString()}` : ""
  return medusaFetch(`/store/products${qs}`)
}

export async function getProductByHandle(
  handle: string
): Promise<MedusaProduct | null> {
  const data = await medusaFetch<{ products: MedusaProduct[] }>(
    `/store/products?handle=${handle}&fields=+metadata,*categories`
  )
  return data.products[0] || null
}

export async function getCategories(): Promise<{
  product_categories: MedusaCategory[]
}> {
  return medusaFetch("/store/product-categories")
}

// ─── Pricing helpers ──────────────────────────────────────

export function getLowestPrice(product: MedusaProduct): number | null {
  let lowest: number | null = null
  for (const v of product.variants) {
    const price = v.calculated_price?.calculated_amount ?? v.prices?.[0]?.amount
    if (price != null && (lowest === null || price < lowest)) {
      lowest = price
    }
  }
  return lowest
}

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Dietary tag helpers ──────────────────────────────────

const dietaryLabels: Record<string, { es: string; en: string; color: string }> =
  {
    gluten_free: { es: "Sin gluten", en: "Gluten-free", color: "#A8B5A0" },
    sugar_free: { es: "Sin azúcar", en: "Sugar-free", color: "#E8A87C" },
    vegan: { es: "Vegano", en: "Vegan", color: "#85B77B" },
    lactose_free: { es: "Sin lactosa", en: "Lactose-free", color: "#96C5F7" },
    celiac_friendly: { es: "Apto celíacos", en: "Celiac-friendly", color: "#C4A882" },
    diabetic_friendly: { es: "Apto diabéticos", en: "Diabetic-friendly", color: "#D4A5A5" },
    low_carb: { es: "Bajo en carbs", en: "Low carb", color: "#B5C7A3" },
  }

const allergenLabels: Record<string, { es: string; en: string }> = {
  nuts: { es: "Frutos secos", en: "Nuts" },
  egg: { es: "Huevo", en: "Egg" },
  milk: { es: "Lácteos", en: "Dairy" },
  soy: { es: "Soya", en: "Soy" },
  peanuts: { es: "Maní", en: "Peanuts" },
  almonds: { es: "Almendras", en: "Almonds" },
  wheat: { es: "Trigo", en: "Wheat" },
}

export function getDietaryLabel(
  tag: string,
  locale: string = "es"
): { label: string; color: string } {
  const info = dietaryLabels[tag]
  if (!info) return { label: tag, color: "#ccc" }
  return {
    label: locale === "en" ? info.en : info.es,
    color: info.color,
  }
}

export function getAllergenLabel(tag: string, locale: string = "es"): string {
  const info = allergenLabels[tag]
  if (!info) return tag
  return locale === "en" ? info.en : info.es
}
