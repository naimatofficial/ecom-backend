import jwt from 'jsonwebtoken'
import keys from '../config/keys.js'

import { setRefreshToken } from './redisService.js'

async function generateRefreshToken(userId, role) {
    const refreshToken = jwt.sign({ userId, role }, keys.refreshSecret, {
        expiresIn: keys.refreshTokenExpiresIn,
    })
    setRefreshToken(userId, refreshToken)
    return refreshToken
}

function generateAccessToken(userId, role) {
    return jwt.sign({ userId, role }, keys.jwtSecret, {
        expiresIn: keys.accessTokenExpiresIn,
    })
}

export async function loginService(user) {
    const accessToken = generateAccessToken(user._id, user.role)

    // Store refreshToken in our Redis Caches
    generateRefreshToken(user._id, user.role)

    return { accessToken }
}
