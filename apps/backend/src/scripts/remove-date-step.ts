import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Migration: Remove delivery_date step from product customization schemas.
 *
 * Delivery date is now chosen once in checkout (not per product).
 * The minDate is calculated from the max preparation_time_days across
 * all cart items, in business days (Mon–Sat).
 *
 * Run with:
 * pnpm --filter @dani-pastelera/backend exec medusa exec src/scripts/remove-date-step.ts
 */
export default async function removeDateStep({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("🗓️  Removing delivery_date step from product customization schemas...")

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "metadata"],
  })

  let updated = 0

  for (const product of products) {
    const meta = (product.metadata as Record<string, any>) || {}
    const schema = meta.customization_schema as Record<string, any> | undefined

    if (!schema?.steps) continue

    const originalCount = schema.steps.length
    const filteredSteps = schema.steps.filter(
      (step: any) => step.type !== "date" && step.id !== "delivery_date"
    )

    if (filteredSteps.length === originalCount) {
      logger.info(`  ⏭️  ${product.handle} — no date step found, skipping`)
      continue
    }

    const updatedSchema = { ...schema, steps: filteredSteps }

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: {
          metadata: {
            ...meta,
            customization_schema: updatedSchema,
          },
        },
      },
    })

    logger.info(
      `  ✅ ${product.handle} — removed ${originalCount - filteredSteps.length} date step(s)`
    )
    updated++
  }

  logger.info(`\n🎉 Done. Updated ${updated} product(s).`)
  logger.info("   Delivery date is now handled in checkout using max preparation_time_days.")
}
