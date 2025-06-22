export default defineNuxtConfig({
  compatibilityDate: '2025-06-22',
  ssr: false, // เรายังคงปิด SSR ไว้ก่อนเพื่อการดีบักที่ง่าย
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