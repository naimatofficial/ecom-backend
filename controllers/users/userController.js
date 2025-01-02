import redisClient from '../config/redisConfig.js'
import User from '../models/userModel.js'
import AppError from '../utils/appError.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './handleFactory.js'

export const createUser = createOne(User)
export const getUsers = getAll(User)
export const getUser = getOne(User)
export const deleteUser = deleteOne(User)
export const updateUser = updateOne(User)

export const updateRole = catchAsync(async (req, res, next) => {
    const { userId, role } = req.body
    const doc = await User.findByIdAndUpdate(
        userId,
        { role },
        {
            new: true,
            runValidators: true,
        }
    )

    if (!doc) {
        return next(new AppError(`No user found with that email`, 404))
    }

    const cacheKeyOne = getCacheKey('User', req.params.id)

    // delete pervious document data
    await redisClient.del(cacheKeyOne)
    // updated the cache with new data
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(doc))

    // Update cache
    const cacheKey = getCacheKey('User', '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})
