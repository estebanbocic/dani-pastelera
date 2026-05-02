import CartProvider, { useCart } from "./CartProvider"
import CartDrawer from "./CartDrawer"

function CartButton() {
  const { itemCount, openCart } = useCart()
  return (
    <button
      onClick={openCart}
      className="relative p-2 text-[#6B5B4E] hover:text-[#8B6F47] transition-colors"
      aria-label="Abrir carrito"
    >
      🛒
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#8B6F47] text-white text-xs rounded-full flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </button>
  )
}

export function CartIconButton() {
  return (
    <CartProvider>
      <CartButton />
      <CartDrawer />
    </CartProvider>
  )
}

// Export CartProvider for pages that need the full context (e.g., product detail with configurator)
export { CartProvider, useCart }
export default CartIsland

function CartIsland({ children }: { children?: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  )
}
