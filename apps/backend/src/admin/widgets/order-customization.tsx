import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Badge, clx } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"

/**
 * Order Customization Widget
 *
 * Shows product customizations, dietary info, allergens, and delivery details
 * in a human-readable format on the order detail page.
 * The owner should never need to read raw JSON.
 */

const dietaryLabels: Record<string, string> = {
  sugar_free: "🍯 Sin azúcar",
  keto: "🥑 Keto",
  vegan: "🌿 Vegano",
  lactose_free: "🥛 Sin lactosa",
  diabetic_friendly: "✅ Apto diabéticos",
  low_carb: "📉 Bajo en carbs",
}

const allergenLabels: Record<string, string> = {
  nuts: "Frutos secos",
  egg: "Huevo",
  milk: "Lácteos",
  soy: "Soya",
  peanuts: "Maní",
  almonds: "Almendras",
  wheat: "Trigo",
}

const OrderCustomizationWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const items = order.items || []

  // Check if any item has customization metadata
  const hasCustomizations = items.some(
    (item) => item.metadata?.selected_options || item.metadata?.price_breakdown
  )

  // Get delivery info from order metadata or first item
  const orderMeta = order.metadata as Record<string, any> || {}

  if (!hasCustomizations && !orderMeta.delivery_info) {
    return null // Don't show widget if no customizations
  }

  return (
    <Container>
      <Heading level="h2" className="mb-4">
        🧁 Detalles de Personalización
      </Heading>

      {items.map((item: any) => {
        const meta = item.metadata as Record<string, any> || {}
        const selectedOptions = meta.selected_options as Record<string, string> || {}
        const priceBreakdown = meta.price_breakdown as any[] || []
        const productMeta = item.variant?.product?.metadata as Record<string, any> || {}
        const dietaryTags = productMeta.dietary_tags as string[] || []
        const allergenTags = productMeta.allergen_tags as string[] || []

        if (!Object.keys(selectedOptions).length && !dietaryTags.length) {
          return null
        }

        return (
          <div key={item.id} className="mb-6 p-4 bg-ui-bg-subtle rounded-lg">
            <Text weight="plus" className="mb-2">
              {item.variant?.product?.title || item.title} — {item.variant?.title}
            </Text>

            {/* Selected Options */}
            {Object.keys(selectedOptions).length > 0 && (
              <div className="mb-3">
                <Text size="small" className="text-ui-fg-muted mb-1">
                  Opciones seleccionadas:
                </Text>
                <div className="space-y-1">
                  {Object.entries(selectedOptions).map(([key, value]) => {
                    if (!value) return null
                    const label = key === "delivery_date" ? "📅 Fecha de entrega"
                      : key === "filling" ? "Relleno"
                      : key === "coverage" ? "Cobertura"
                      : key === "decoration" ? "Decoración"
                      : key === "message" ? "💬 Mensaje"
                      : key === "topping" ? "Topping"
                      : key
                    return (
                      <div key={key} className="flex gap-2">
                        <Text size="small" className="text-ui-fg-muted min-w-[120px]">
                          {label}:
                        </Text>
                        <Text size="small" weight="plus">
                          {value}
                        </Text>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Dietary Tags */}
            {dietaryTags.length > 0 && (
              <div className="mb-2">
                <Text size="small" className="text-ui-fg-muted mb-1">
                  Perfil dietario:
                </Text>
                <div className="flex flex-wrap gap-1">
                  {dietaryTags.map((tag) => (
                    <Badge key={tag} color="green" size="small">
                      {dietaryLabels[tag] || tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergen Tags */}
            {allergenTags.length > 0 && (
              <div className="mb-2">
                <Text size="small" className="text-ui-fg-muted mb-1">
                  ⚠️ Alérgenos:
                </Text>
                <div className="flex flex-wrap gap-1">
                  {allergenTags.map((tag) => (
                    <Badge key={tag} color="red" size="small">
                      Contiene {allergenLabels[tag] || tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            {priceBreakdown.length > 0 && (
              <div className="mt-3 pt-2 border-t border-ui-border-base">
                <Text size="small" className="text-ui-fg-muted mb-1">
                  Desglose de precio:
                </Text>
                {priceBreakdown.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <Text size="small">{item.label?.es || item.label}</Text>
                    <Text size="small" weight="plus">
                      {item.type === "extra" ? "+" : ""}${item.amount?.toLocaleString("es-CL")}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Delivery Info from order metadata */}
      {orderMeta.delivery_info && (
        <div className="p-4 bg-ui-bg-subtle rounded-lg">
          <Text weight="plus" className="mb-2">🚗 Información de Entrega</Text>
          <div className="space-y-1">
            <Text size="small">
              <strong>Método:</strong>{" "}
              {orderMeta.delivery_info.method === "pickup" ? "📍 Retiro en tienda" : "🚗 Delivery"}
            </Text>
            {orderMeta.delivery_info.address && (
              <Text size="small">
                <strong>Dirección:</strong> {orderMeta.delivery_info.address}, {orderMeta.delivery_info.commune}
              </Text>
            )}
            {orderMeta.delivery_info.date && (
              <Text size="small">
                <strong>Fecha:</strong> {orderMeta.delivery_info.date}
              </Text>
            )}
            {orderMeta.delivery_info.notes && (
              <Text size="small">
                <strong>Notas:</strong> {orderMeta.delivery_info.notes}
              </Text>
            )}
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderCustomizationWidget
