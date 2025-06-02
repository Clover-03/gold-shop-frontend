export default defineNuxtConfig({
  css: [
    'vuetify/styles',
    '@/assets/styles/main.css' // เพิ่มบรรทัดนี้
  ],
  build: {
    transpile: ['vuetify'],
  },
})