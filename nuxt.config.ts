export default defineNuxtConfig({
    devtools: {
        enabled: true
    },
    modules: ['@nuxt/devtools', '@pinia/nuxt'],
    nitro: {
        runtimeConfig: {
            redis: { // Default values
                host: '',
                port: 0,
                /* other redis connector options */
            }
        },
        experimental: {
            websocket: true
        },
    }
})