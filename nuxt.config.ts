export default defineNuxtConfig({
    devtools: {
        enabled: true
    },
    modules: ['@nuxt/devtools', '@pinia/nuxt'],
    nitro: {
        experimental: {
            websocket: true
        },
    }
})