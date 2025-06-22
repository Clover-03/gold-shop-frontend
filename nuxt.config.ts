export default defineNuxtConfig({
  compatibilityDate: '2025-06-22',
 
  devtools: { enabled: true },
  css: ['@/assets/styles/main.css'],
  modules: [
    ['vuetify-nuxt-module', {
      vuetifyOptions: {
        theme: {
          defaultTheme: 'light'
        }
      }
    }]
  ],
  devServer: {
    port: 3333
  }
})

