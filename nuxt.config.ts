export default defineNuxtConfig({
    devtools: {
        enabled: true
    },
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