import type { ExecArgs } from "@medusajs/framework/types"
import { updateRegionsWorkflow } from "@medusajs/core-flows"

const MERCADO_PAGO_PROVIDER_ID = "pp_mercado-pago_mercado-pago"

type Region = {
  id: string
  name: string
  currency_code: string
}

/**
 * Enables Checkout Pro for the existing Chilean region without recreating catalog data.
 *
 * Run with:
 * pnpm --filter @dani-pastelera/backend exec medusa exec src/scripts/enable-mercado-pago.ts
 */
export default async function enableMercadoPago({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const query = container.resolve("query")
  const { data } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
    filters: { currency_code: "clp" },
  })
  const regions = data as Region[]

  if (regions.length === 0) {
    throw new Error("No CLP region found. Create the Chile region before enabling Mercado Pago.")
  }

  for (const region of regions) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { payment_providers: [MERCADO_PAGO_PROVIDER_ID] },
      },
    })
    logger.info(`Enabled Mercado Pago for ${region.name} (${region.id})`)
  }
}
