import Redis from 'redis'
import keys from './keys.js'

const redisClient = Redis.createClient({
    url: keys.redisURL,
    // password: keys.redisPassword,
})

redisClient.on('error', (err) => console.log('Redis Client Error', err))

await redisClient.connect()

console.log('Redis cache database connected..')

export default redisClient
