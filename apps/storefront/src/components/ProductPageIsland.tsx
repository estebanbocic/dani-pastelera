import CartProvider, { useCart } from "./cart/CartProvider"
import CartDrawer from "./cart/CartDrawer"
import ProductConfigurator from "./configurator/ProductConfigurator"
import type { CustomizationSchema } from "@dani-pastelera/shared-types"

type VariantInfo = {
  id: string
  title: string
  price: number
}

type Props = {
  productTitle: string
  schema: CustomizationSchema
  variants: VariantInfo[]
}

function ConfiguratorWithCart({ productTitle, schema, variants }: Props) {
  const { addItem } = useCart()

  return (
    <ProductConfigurator
      productTitle={productTitle}
      schema={schema}
      variants={variants}
      onAddToCart={async (variantId, quantity, metadata) => {
        await addItem(variantId, quantity, metadata)
      }}
    />
  )
}

function CartButton() {
  const { itemCount, openCart } = useCart()
  return (
    <button
      onClick={openCart}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 bg-[#8B6F47] text-white rounded-full shadow-lg flex items-center justify-center text-xl hover:bg-[#7A5F3D] transition-colors"
      aria-label="Abrir carrito"
    >
      🛒
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {itemCount}
        </span>
      )}
    </button>
  )
}

export default function ProductPageIsland({ productTitle, schema, variants }: Props) {
  return (
    <CartProvider>
      <ConfiguratorWithCart
        productTitle={productTitle}
        schema={schema}
        variants={variants}
      />
      <CartButton />
      <CartDrawer />
    </CartProvider>
  )
}
