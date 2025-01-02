import redisClient from '../config/redisConfig.js'
import AppError from '../utils/appError.js'

export function setRefreshToken(userId, refreshToken) {
    redisClient.SETEX(`refreshToken:${userId}`, 30 * 24 * 60 * 60, refreshToken)
}

// Function to delete keys matching a specific pattern using pipelining
export async function deleteKeysByPattern(model) {
    try {
        const pattern = `cache:${model}:*`

        const result = await redisClient.scan(0, {
            MATCH: pattern,
            COUNT: 1000,
        })
        const keys = result.keys

        console.log(keys)
        const pipeline = redisClient.multi()

        keys.forEach((key) => {
            console.log(key)
            return pipeline.del(key)
        })
        await pipeline.exec()

        console.log(`All keys matching pattern '${pattern}' have been deleted.`)
    } catch (error) {
        console.error('Error deleting keys:', error)
    }
}

export async function getRefreshToken(userId, next) {
    try {
        const refreshToken = await redisClient.GET(`refreshToken:${userId}`)
        return refreshToken || false
    } catch (err) {
        console.error('Error accessing Redis:', err)
        return next(new AppError('Error accessing Redis cache.', 500))
    }

    // return new Promise((resolve, reject) => {
    //     redisClient.GET(`refreshToken:${userId}`, (err, refreshToken) => {
    //         if (err) reject(err)
    //         resolve(refreshToken)
    //     })
    // })
}

export function removeRefreshToken(userId) {
    redisClient.DEL(`refreshToken:${userId}`)
}
