import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { addToCartWorkflow } from "@medusajs/medusa/core-flows"

/**
 * POST /store/custom-cart
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
    const { result } = await addToCartWorkflow(req.scope).run({
      input: {
        cart_id,
        items: [
          {
            variant_id,
            quantity,
            unit_price,
            metadata: metadata || {},
          },
        ],
      },
    })

    return res.status(200).json({ cart: result })
  } catch (err: any) {
    const logger = req.scope.resolve("logger")
    logger.error(`[Custom Cart] Error adding item: ${err.message}`)
    return res.status(500).json({ message: err.message })
  }
}
