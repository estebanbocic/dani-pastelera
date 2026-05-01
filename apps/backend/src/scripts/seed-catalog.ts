import { ExecArgs } from "@medusajs/framework/types"
import {
  createProductCategoriesWorkflow,
  deleteProductsWorkflow,
  createProductsWorkflow,
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"

export default async function seedCatalog({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")

  logger.info("🧹 Cleaning seed data...")

  // ─── Delete existing demo products ────────────────────────
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  })

  if (existingProducts.length > 0) {
    logger.info(`Deleting ${existingProducts.length} demo products...`)
    await deleteProductsWorkflow(container).run({
      input: { ids: existingProducts.map((p: any) => p.id) },
    })
    logger.info("✅ Demo products deleted")
  }

  // ─── Create product categories ────────────────────────────
  logger.info("📁 Creating product categories...")

  const categories = [
    { name: "Sin Gluten", handle: "sin-gluten", description: "Productos libres de gluten, aptos para celíacos", is_active: true, is_internal: false, rank: 0 },
    { name: "Sin Azúcar", handle: "sin-azucar", description: "Productos sin azúcar añadida, aptos para diabéticos", is_active: true, is_internal: false, rank: 1 },
    { name: "Vegano", handle: "vegano", description: "Productos 100% veganos, sin ingredientes de origen animal", is_active: true, is_internal: false, rank: 2 },
    { name: "Tortas", handle: "tortas", description: "Tortas para cumpleaños, celebraciones y eventos especiales", is_active: true, is_internal: false, rank: 3 },
    { name: "Brownies", handle: "brownies", description: "Brownies artesanales en distintas versiones saludables", is_active: true, is_internal: false, rank: 4 },
    { name: "Galletas", handle: "galletas", description: "Galletas artesanales para toda la familia", is_active: true, is_internal: false, rank: 5 },
    { name: "Cupcakes", handle: "cupcakes", description: "Cupcakes decorados, perfectos para regalar", is_active: true, is_internal: false, rank: 6 },
    { name: "Cajas de Regalo", handle: "cajas-de-regalo", description: "Cajas surtidas para regalar momentos dulces", is_active: true, is_internal: false, rank: 7 },
    { name: "Tradicional", handle: "tradicional", description: "Pastelería tradicional con recetas clásicas", is_active: true, is_internal: false, rank: 8 },
  ]

  const { result: createdCategories } = await createProductCategoriesWorkflow(container).run({
    input: { product_categories: categories },
  })

  const categoryMap = new Map<string, string>()
  for (const cat of createdCategories) {
    categoryMap.set(cat.handle, cat.id)
    logger.info(`  ✅ ${cat.name} (${cat.handle})`)
  }

  // ─── Get default sales channel ────────────────────────────
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const defaultSalesChannel = salesChannels[0]
  logger.info(`📺 Using sales channel: ${defaultSalesChannel.name}`)

  // ─── Create publishable API key ───────────────────────────
  logger.info("🔑 Creating publishable API key...")

  const { result: apiKeyResult } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "Storefront Publishable Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  })

  const publishableKey = apiKeyResult[0]
  logger.info(`  ✅ Key: ${publishableKey.token}`)

  // Link publishable key to sales channel
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableKey.id,
      add: [defaultSalesChannel.id],
    },
  })
  logger.info("  ✅ Linked to default sales channel")

  // ─── Get default region for pricing ───────────────────────
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })
  const defaultRegion = regions[0]
  logger.info(`🌍 Using region: ${defaultRegion.name} (${defaultRegion.currency_code})`)

  // ─── Create sample products ───────────────────────────────
  logger.info("🧁 Creating sample products...")

  const products = [
    {
      title: "Torta Brownie Saludable",
      handle: "torta-brownie-saludable",
      description: "Nuestra torta brownie insignia, preparada con ingredientes saludables y sin gluten. Perfecta para cumpleaños y celebraciones. Textura húmeda y sabor intenso a chocolate.",
      status: "published" as const,
      is_giftcard: false,
      categories: [
        { id: categoryMap.get("tortas")! },
        { id: categoryMap.get("sin-gluten")! },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        dietary_tags: ["gluten_free", "celiac_friendly"],
        allergen_tags: ["egg", "nuts"],
        preparation_time_days: 2,
      },
      options: [
        { title: "Porciones", values: ["8 porciones", "10 porciones", "15 porciones", "20 porciones"] },
      ],
      variants: [
        {
          title: "8 porciones",
          sku: "TBS-8",
          manage_inventory: false,
          prices: [{ amount: 18990, currency_code: defaultRegion.currency_code }],
          options: { "Porciones": "8 porciones" },
          metadata: { portions: 8 },
        },
        {
          title: "10 porciones",
          sku: "TBS-10",
          manage_inventory: false,
          prices: [{ amount: 22990, currency_code: defaultRegion.currency_code }],
          options: { "Porciones": "10 porciones" },
          metadata: { portions: 10 },
        },
        {
          title: "15 porciones",
          sku: "TBS-15",
          manage_inventory: false,
          prices: [{ amount: 32990, currency_code: defaultRegion.currency_code }],
          options: { "Porciones": "15 porciones" },
          metadata: { portions: 15 },
        },
        {
          title: "20 porciones",
          sku: "TBS-20",
          manage_inventory: false,
          prices: [{ amount: 42990, currency_code: defaultRegion.currency_code }],
          options: { "Porciones": "20 porciones" },
          metadata: { portions: 20 },
        },
      ],
    },
    {
      title: "Cheesecake Sin Azúcar",
      handle: "cheesecake-sin-azucar",
      description: "Cheesecake cremoso endulzado con stevia y frutos naturales. Sin azúcar añadida, apto para diabéticos. Base de galleta sin gluten.",
      status: "published" as const,
      is_giftcard: false,
      categories: [
        { id: categoryMap.get("tortas")! },
        { id: categoryMap.get("sin-azucar")! },
        { id: categoryMap.get("sin-gluten")! },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        dietary_tags: ["sugar_free", "gluten_free", "diabetic_friendly", "celiac_friendly"],
        allergen_tags: ["milk", "egg"],
        preparation_time_days: 2,
      },
      options: [
        { title: "Porciones", values: ["8 porciones", "10 porciones", "15 porciones"] },
      ],
      variants: [
        {
          title: "8 porciones",
          sku: "CSA-8",
          manage_inventory: false,
          prices: [{ amount: 21990, currency_code: defaultRegion.currency_code }],
          options: { "Porciones": "8 porciones" },
          metadata: { portions: 8 },
        },
        {
          title: "10 porciones",
          sku: "CSA-10",
          manage_inventory: false,
          prices: [{ amount: 26990, currency_code: defaultRegion.currency_code }],
          options: { "Porciones": "10 porciones" },
          metadata: { portions: 10 },
        },
        {
          title: "15 porciones",
          sku: "CSA-15",
          manage_inventory: false,
          prices: [{ amount: 36990, currency_code: defaultRegion.currency_code }],
          options: { "Porciones": "15 porciones" },
          metadata: { portions: 15 },
        },
      ],
    },
    {
      title: "Cupcakes Veganos",
      handle: "cupcakes-veganos",
      description: "Cupcakes 100% veganos con cobertura de crema de coco. Disponibles en sabores chocolate, vainilla y frutos rojos. Perfectos para regalar.",
      status: "published" as const,
      is_giftcard: false,
      categories: [
        { id: categoryMap.get("cupcakes")! },
        { id: categoryMap.get("vegano")! },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        dietary_tags: ["vegan", "lactose_free"],
        allergen_tags: ["nuts"],
        preparation_time_days: 1,
      },
      options: [
        { title: "Cantidad", values: ["Caja de 6", "Caja de 12"] },
      ],
      variants: [
        {
          title: "Caja de 6",
          sku: "CV-6",
          manage_inventory: false,
          prices: [{ amount: 12990, currency_code: defaultRegion.currency_code }],
          options: { "Cantidad": "Caja de 6" },
          metadata: { units: 6 },
        },
        {
          title: "Caja de 12",
          sku: "CV-12",
          manage_inventory: false,
          prices: [{ amount: 23990, currency_code: defaultRegion.currency_code }],
          options: { "Cantidad": "Caja de 12" },
          metadata: { units: 12 },
        },
      ],
    },
    {
      title: "Galletas Sin Gluten Surtidas",
      handle: "galletas-sin-gluten-surtidas",
      description: "Mix de galletas artesanales sin gluten: chocolate chip, avena con pasas y mantequilla de maní. Crujientes por fuera, suaves por dentro.",
      status: "published" as const,
      is_giftcard: false,
      categories: [
        { id: categoryMap.get("galletas")! },
        { id: categoryMap.get("sin-gluten")! },
      ],
      sales_channels: [{ id: defaultSalesChannel.id }],
      metadata: {
        dietary_tags: ["gluten_free", "celiac_friendly"],
        allergen_tags: ["egg", "milk", "peanuts", "nuts"],
        preparation_time_days: 1,
      },
      options: [
        { title: "Cantidad", values: ["Bolsa de 6", "Bolsa de 12", "Caja regalo de 24"] },
      ],
      variants: [
        {
          title: "Bolsa de 6",
          sku: "GSG-6",
          manage_inventory: false,
          prices: [{ amount: 6990, currency_code: defaultRegion.currency_code }],
          options: { "Cantidad": "Bolsa de 6" },
          metadata: { units: 6 },
        },
        {
          title: "Bolsa de 12",
          sku: "GSG-12",
          manage_inventory: false,
          prices: [{ amount: 11990, currency_code: defaultRegion.currency_code }],
          options: { "Cantidad": "Bolsa de 12" },
          metadata: { units: 12 },
        },
        {
          title: "Caja regalo de 24",
          sku: "GSG-24",
          manage_inventory: false,
          prices: [{ amount: 19990, currency_code: defaultRegion.currency_code }],
          options: { "Cantidad": "Caja regalo de 24" },
          metadata: { units: 24 },
        },
      ],
    },
  ]

  const { result: createdProducts } = await createProductsWorkflow(container).run({
    input: { products },
  })

  for (const p of createdProducts) {
    logger.info(`  ✅ ${p.title} (${p.variants.length} variants)`)
  }

  // ─── Summary ──────────────────────────────────────────────
  logger.info("\n🎉 Catalog seed complete!")
  logger.info(`   Categories: ${createdCategories.length}`)
  logger.info(`   Products: ${createdProducts.length}`)
  logger.info(`   Publishable key: ${publishableKey.token}`)
  logger.info("\n   Save the publishable key in your storefront .env:")
  logger.info(`   PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey.token}`)
}
