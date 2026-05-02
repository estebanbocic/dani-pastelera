import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import {
  ensureCart,
  addLineItem,
  addConfiguredItem,
  removeLineItem,
  getCart,
  getCartId,
  type Cart,
  type CartLineItem,
} from "../../lib/cart"

type CartContextType = {
  cart: Cart | null
  items: CartLineItem[]
  itemCount: number
  isOpen: boolean
  isLoading: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: string, quantity: number, metadata?: Record<string, any>) => Promise<void>
  removeItem: (lineItemId: string) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const items = cart?.items || []
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Load cart on mount
  useEffect(() => {
    const cartId = getCartId()
    if (cartId) {
      getCart(cartId).then((c) => { if (c) setCart(c) })
    }
  }, [])

  const refreshCart = useCallback(async () => {
    const cartId = getCartId()
    if (cartId) {
      const c = await getCart(cartId)
      if (c) setCart(c)
    }
  }, [])

  const addItem = useCallback(async (
    variantId: string,
    quantity: number,
    metadata?: Record<string, any>
  ) => {
    setIsLoading(true)
    try {
      const currentCart = await ensureCart()
      let updated: Cart

      // If metadata has total_amount, use custom endpoint with correct price
      if (metadata?.total_amount) {
        updated = await addConfiguredItem(
          currentCart.id,
          variantId,
          quantity,
          metadata.total_amount,
          metadata
        )
      } else {
        updated = await addLineItem(currentCart.id, variantId, quantity, metadata)
      }

      setCart(updated)
      setIsOpen(true) // Open drawer after adding
    } catch (err) {
      console.error("Failed to add item:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (lineItemId: string) => {
    if (!cart) return
    setIsLoading(true)
    try {
      const updated = await removeLineItem(cart.id, lineItemId)
      setCart(updated)
    } catch (err) {
      console.error("Failed to remove item:", err)
    } finally {
      setIsLoading(false)
    }
  }, [cart])

  return (
    <CartContext.Provider value={{
      cart,
      items,
      itemCount,
      isOpen,
      isLoading,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}
