import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const mercadoPagoMode = process.env.MERCADO_PAGO_MODE || "test"

if (mercadoPagoMode !== "test" && mercadoPagoMode !== "production") {
  throw new Error("MERCADO_PAGO_MODE must be either 'test' or 'production'")
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/mercado-pago",
            id: "mercado-pago",
            options: {
              mode: mercadoPagoMode,
              testAccessToken: process.env.MERCADO_PAGO_TEST_ACCESS_TOKEN,
              productionAccessToken: process.env.MERCADO_PAGO_PRODUCTION_ACCESS_TOKEN,
            },
          },
        ],
      },
    },
  ],
})
