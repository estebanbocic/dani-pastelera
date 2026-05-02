import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

/**
 * POST /store/custom-cart/add-item
 *
 * Adds a configured product to the cart with the correct price
 * that includes customization extras (filling, coverage, decoration, etc.)
 *
 * Body:
 * {
 *   cart_id: string
 *   variant_id: string
 *   quantity: number
 *   unit_price: number       // The full configured price (base + extras)
 *   metadata?: object        // Selected options, price breakdown, etc.
 * }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as any
  const { cart_id, variant_id, quantity, unit_price, metadata } = body

  if (!cart_id || !variant_id || !quantity || unit_price == null) {
    return res.status(400).json({
      message: "Missing required fields: cart_id, variant_id, quantity, unit_price",
    })
  }

  try {
    const cartService = req.scope.resolve(Modules.CART)

    // Add line item with the configured unit_price
    const lineItems = await cartService.addLineItems(cart_id, [
      {
        variant_id,
        quantity,
        unit_price,
        metadata: metadata || {},
      },
    ])

    // Fetch updated cart
    const cart = await cartService.retrieveCart(cart_id, {
      relations: ["items", "items.variant", "items.variant.product"],
    })

    return res.status(200).json({ cart })
  } catch (err: any) {
    const logger = req.scope.resolve("logger")
    logger.error(`[Custom Cart] Error adding item: ${err.message}`)
    return res.status(500).json({ message: err.message })
  }
}
