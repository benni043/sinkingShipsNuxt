import redisDriver from 'unstorage/drivers/redis'

export default defineNitroPlugin(() => {
    const storage = useStorage()

    const driver = redisDriver({
        base: 'redis',
        host: useRuntimeConfig().redis.host,
        port: useRuntimeConfig().redis.port,
    })

    storage.mount('redis', driver)
})
