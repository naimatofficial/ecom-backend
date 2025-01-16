import zlib from 'zlib'
import redisClient from '../config/redisConfig.js'

export const setCacheData = async (key, data) => {
    const compressed = zlib.gzipSync(JSON.stringify(data))
    await redisClient.set(key, compressed.toString('base64'), 'EX', 3600)
}

export const getCacheData = async (key) => {
    const compressed = await redisClient.get(key)
    if (!compressed) return null

    const decompressed = zlib.gunzipSync(Buffer.from(compressed, 'base64'))
    return JSON.parse(decompressed.toString())
}
