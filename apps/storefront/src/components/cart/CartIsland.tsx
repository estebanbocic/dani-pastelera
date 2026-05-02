import CartProvider, { useCart } from "./CartProvider"
import CartDrawer from "./CartDrawer"

function CartButton() {
  const { itemCount, openCart } = useCart()
  return (
    <button
      onClick={openCart}
      className="relative flex items-center gap-2 bg-[#8B6F47] text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-[#7A5F3D] transition-colors shadow-sm"
      aria-label="Abrir carrito"
    >
      {/* Standard shopping cart SVG icon */}
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {itemCount > 0 ? (
        <span className="bg-white text-[#8B6F47] text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      ) : (
        <span>Carrito</span>
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
