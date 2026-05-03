import { ExecArgs } from "@medusajs/framework/types"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function seedConfigurator({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("🔧 Seeding product customization schemas...")

  // ─── Get products ─────────────────────────────────────────
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
  })

  const tortaBrownie = products.find((p: any) => p.handle === "torta-brownie-saludable")
  const cheesecake = products.find((p: any) => p.handle === "cheesecake-sin-azucar")

  if (!tortaBrownie) {
    logger.error("❌ Torta Brownie Saludable not found. Run seed-catalog first.")
    return
  }

  // ─── Torta Brownie Schema ─────────────────────────────────
  const tortaSchema = {
    id: "schema_torta_brownie",
    productId: tortaBrownie.id,
    steps: [
      {
        id: "filling",
        label: { es: "Relleno", en: "Filling" },
        description: { es: "Elige el relleno de tu torta", en: "Choose your cake filling" },
        type: "single_select",
        required: true,
        options: [
          {
            id: "filling_none",
            label: { es: "Sin relleno", en: "No filling" },
            priceDelta: 0,
            isDefault: true,
            isActive: true,
          },
          {
            id: "filling_frambuesa",
            label: { es: "Frambuesa", en: "Raspberry" },
            priceDelta: 2000,
            isActive: true,
          },
          {
            id: "filling_manjar",
            label: { es: "Manjar", en: "Dulce de leche" },
            priceDelta: 1500,
            isActive: true,
          },
          {
            id: "filling_chocolate",
            label: { es: "Chocolate", en: "Chocolate" },
            priceDelta: 2000,
            isActive: true,
          },
          {
            id: "filling_cream_cheese",
            label: { es: "Crema de queso", en: "Cream cheese" },
            priceDelta: 2500,
            dietaryTags: ["milk"],
            incompatibleWith: ["dietary_vegan"],
            isActive: true,
          },
        ],
      },
      {
        id: "coverage",
        label: { es: "Cobertura", en: "Coverage" },
        description: { es: "Elige la cobertura", en: "Choose the coverage" },
        type: "single_select",
        required: true,
        options: [
          {
            id: "coverage_none",
            label: { es: "Sin cobertura", en: "No coverage" },
            priceDelta: 0,
            isDefault: true,
            isActive: true,
          },
          {
            id: "coverage_chocolate_70",
            label: { es: "Chocolate 70%", en: "70% Chocolate" },
            priceDelta: 1500,
            isActive: true,
          },
          {
            id: "coverage_coconut_cream",
            label: { es: "Crema de coco", en: "Coconut cream" },
            priceDelta: 2000,
            dietaryTags: ["vegan"],
            isActive: true,
          },
          {
            id: "coverage_buttercream",
            label: { es: "Buttercream", en: "Buttercream" },
            priceDelta: 2000,
            dietaryTags: ["milk"],
            incompatibleWith: ["dietary_vegan"],
            isActive: true,
          },
        ],
      },
      {
        id: "decoration",
        label: { es: "Decoración", en: "Decoration" },
        description: { es: "Elige el estilo de decoración", en: "Choose decoration style" },
        type: "single_select",
        required: true,
        options: [
          {
            id: "decoration_simple",
            label: { es: "Simple", en: "Simple" },
            priceDelta: 0,
            isDefault: true,
            isActive: true,
          },
          {
            id: "decoration_birthday",
            label: { es: "Cumpleaños", en: "Birthday" },
            description: { es: "Con vela y topper", en: "With candle and topper" },
            priceDelta: 2500,
            isActive: true,
          },
          {
            id: "decoration_custom",
            label: { es: "Personalizada", en: "Custom" },
            description: { es: "Diseño a medida", en: "Custom design" },
            priceDelta: 3500,
            isActive: true,
          },
        ],
      },
      {
        id: "message",
        label: { es: "Mensaje personalizado", en: "Personalized message" },
        description: { es: "Agrega un mensaje en tu torta (máx. 50 caracteres)", en: "Add a message on your cake (max 50 chars)" },
        type: "text",
        required: false,
        options: [
          {
            id: "message_text",
            label: { es: "Mensaje", en: "Message" },
            priceDelta: 1000,
            isActive: true,
          },
        ],
      },
    ],
    compatibilityRules: [
      {
        id: "rule_vegan_no_dairy_filling",
        condition: { selectedOptionId: "dietary_vegan" },
        effect: {
          disableOptionIds: ["filling_cream_cheese", "coverage_buttercream"],
          showWarning: { es: "Opción no disponible en versión vegana", en: "Option not available in vegan version" },
        },
      },
    ],
  }

  // ─── Update Torta Brownie metadata ────────────────────────
  const existingMeta = (tortaBrownie.metadata as Record<string, any>) || {}
  await updateProductsWorkflow(container).run({
    input: {
      selector: { id: tortaBrownie.id },
      update: {
        metadata: {
          ...existingMeta,
          customization_schema: tortaSchema,
        },
      },
    },
  })
  logger.info("  ✅ Torta Brownie Saludable — customization schema attached")

  // ─── Cheesecake Schema (simpler) ──────────────────────────
  if (cheesecake) {
    const cheesecakeSchema = {
      id: "schema_cheesecake",
      productId: cheesecake.id,
      steps: [
        {
          id: "topping",
          label: { es: "Topping", en: "Topping" },
          description: { es: "Elige el topping de tu cheesecake", en: "Choose your cheesecake topping" },
          type: "single_select",
          required: true,
          options: [
            {
              id: "topping_berries",
              label: { es: "Frutos rojos", en: "Mixed berries" },
              priceDelta: 0,
              isDefault: true,
              isActive: true,
            },
            {
              id: "topping_passion_fruit",
              label: { es: "Maracuyá", en: "Passion fruit" },
              priceDelta: 1500,
              isActive: true,
            },
            {
              id: "topping_mango",
              label: { es: "Mango", en: "Mango" },
              priceDelta: 1500,
              isActive: true,
            },
          ],
        },
        {
          id: "message",
          label: { es: "Mensaje personalizado", en: "Personalized message" },
          type: "text",
          required: false,
          options: [
            {
              id: "message_text",
              label: { es: "Mensaje", en: "Message" },
              priceDelta: 1000,
              isActive: true,
            },
          ],
        },
      ],
      compatibilityRules: [],
    }

    const cheesecakeMeta = (cheesecake.metadata as Record<string, any>) || {}
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: cheesecake.id },
        update: {
          metadata: {
            ...cheesecakeMeta,
            customization_schema: cheesecakeSchema,
          },
        },
      },
    })
    logger.info("  ✅ Cheesecake Sin Azúcar — customization schema attached")
  }

  logger.info("\n🎉 Configurator schemas seeded!")
}
