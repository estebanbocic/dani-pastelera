import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  createProductCategoriesWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Migration: Replace "Sin Gluten" pillar with "Keto"
 *
 * What this script does:
 * 1. Creates the "Keto" category if it doesn't exist
 * 2. Deactivates (hides) the "Sin Gluten" category
 * 3. Updates existing products:
 *    - Removes gluten_free / celiac_friendly dietary tags
 *    - Adds keto tag where appropriate
 *    - Removes references to "sin gluten" from descriptions
 *    - Renames "Galletas Sin Gluten Surtidas"
 *
 * Run with: pnpm --filter @dani-pastelera/backend exec medusa exec src/scripts/update-pillars.ts
 */
export default async function updatePillars({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("🔄 Starting pillar migration: Sin Gluten → Keto")

  // ─── 1. Get existing categories ───────────────────────────
  const { data: existingCats } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "handle", "is_active"],
  })

  const catByHandle = new Map(existingCats.map((c: any) => [c.handle, c]))
  const sinGlutenCat = catByHandle.get("sin-gluten")
  const ketoCat = catByHandle.get("keto")

  // ─── 2. Create Keto category if missing ───────────────────
  let ketoId: string

  if (ketoCat) {
    ketoId = ketoCat.id
    logger.info(`  ✅ Keto category already exists (${ketoId})`)
  } else {
    logger.info("  📁 Creating Keto category...")
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: "Keto",
            handle: "keto",
            description: "Bajo en carbohidratos, alto en grasas buenas. Para quienes siguen un estilo de vida keto.",
            is_active: true,
            is_internal: false,
            rank: 1,
          },
        ],
      },
    })
    ketoId = result[0].id
    logger.info(`  ✅ Keto category created (${ketoId})`)
  }

  // ─── 3. Deactivate Sin Gluten category ────────────────────
  const productModuleService = container.resolve(Modules.PRODUCT) as any

  if (sinGlutenCat) {
    await productModuleService.updateProductCategories(sinGlutenCat.id, {
      is_active: false,
      is_internal: true,
    })
    logger.info(`  🗂️  Sin Gluten category deactivated (hidden from storefront)`)
  } else {
    logger.info("  ℹ️  Sin Gluten category not found — skipping")
  }

  // ─── 4. Fetch all products with metadata and categories ───
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "description", "metadata", "categories.*"],
  })

  logger.info(`\n🧁 Updating ${products.length} products...`)

  const productService = productModuleService

  for (const product of products) {
    const meta = (product.metadata as Record<string, any>) || {}
    const dietaryTags: string[] = meta.dietary_tags || []
    let updated = false
    const updates: Record<string, any> = {}

    // Remove gluten claims from dietary tags
    const hadGlutenTag = dietaryTags.includes("gluten_free") || dietaryTags.includes("celiac_friendly")
    const newTags = dietaryTags.filter(
      (t: string) => t !== "gluten_free" && t !== "celiac_friendly"
    )

    // Add keto tag if the product was gluten-free (artisan baked goods that
    // use almond/coconut flour are typically keto) and doesn't already have it
    const shouldAddKeto =
      hadGlutenTag &&
      !newTags.includes("keto") &&
      !newTags.includes("vegan") // vegan products may not be keto

    if (shouldAddKeto) newTags.unshift("keto")

    if (JSON.stringify(newTags) !== JSON.stringify(dietaryTags)) {
      updates.metadata = { ...meta, dietary_tags: newTags }
      updated = true
    }

    // Clean description: remove "sin gluten" / "libre de gluten" phrases
    const desc: string = product.description || ""
    const cleanedDesc = desc
      .replace(/\bsin gluten\b/gi, "")
      .replace(/\blibre de gluten\b/gi, "")
      .replace(/\bapto para cel[ií]acos\b/gi, "")
      .replace(/\s{2,}/g, " ")
      .replace(/,\s*\./g, ".")
      .replace(/\.\s*\./g, ".")
      .trim()

    if (cleanedDesc !== desc) {
      updates.description = cleanedDesc
      updated = true
    }

    // Rename product if it has "Sin Gluten" in the title
    if (product.title.toLowerCase().includes("sin gluten")) {
      const newTitle = product.title
        .replace(/\bSin Gluten\b/gi, "Artesanal")
        .replace(/\s{2,}/g, " ")
        .trim()
      updates.title = newTitle
      updated = true
    }

    if (updated) {
      await productService.updateProducts(product.id, updates)
      logger.info(`  ✅ Updated: ${product.title}`)
      if (updates.title) logger.info(`     → Renamed to: ${updates.title}`)
      if (updates.metadata) logger.info(`     → Tags: ${updates.metadata.dietary_tags.join(", ")}`)
    }

    // Swap category: remove sin-gluten, add keto (if product was in sin-gluten)
    const productCatHandles: string[] = (product.categories || []).map((c: any) => c.handle)
    const isInSinGluten = productCatHandles.includes("sin-gluten")
    const isAlreadyKeto = productCatHandles.includes("keto")

    if (isInSinGluten && !isAlreadyKeto && sinGlutenCat) {
      // Get current category IDs, replace sin-gluten with keto
      const currentCatIds: string[] = (product.categories || [])
        .filter((c: any) => c.handle !== "sin-gluten")
        .map((c: any) => c.id)
      currentCatIds.push(ketoId)

      await productService.updateProducts(product.id, {
        categories: currentCatIds.map((id) => ({ id })),
      })
      logger.info(`  🔁 ${product.title}: swapped sin-gluten → keto category`)
    }
  }

  logger.info("\n🎉 Pillar migration complete!")
  logger.info("   ✅ Keto category ready")
  logger.info("   ✅ Sin Gluten category hidden")
  logger.info("   ✅ Products updated (tags, descriptions, categories)")
  logger.info("\n   Remember to also update .env and re-deploy the storefront.")
}
