import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      graphqlEndpoint:
        process.env.NUXT_PUBLIC_GRAPHQL_ENDPOINT ?? 'http://localhost:3001/graphql'
    }
  },
  css: ['vuetify/styles'],
  build: {
    transpile: ['vuetify']
  },
  vite: {
    plugins: [
      vuetify({ autoImport: true })
    ]
  }
})
