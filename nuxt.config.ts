export default defineNuxtConfig({
    srcDir: "src/",
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