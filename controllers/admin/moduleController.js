// // Pseudocode

//

import Module from './../../models/admin/moduleModel.js'

import { getCacheKey } from '../../utils/helpers.js'
import redisClient from '../../config/redisConfig.js'
import AppError from '../../utils/appError.js'

import {
    checkFields,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../../factory/handleFactory.js'
import catchAsync from '../../utils/catchAsync.js'

export const createModule = catchAsync(async (req, res, next) => {
    const { name, description } = req.body

    const doc = await Module.create({
        name,
        description,
    })

    if (!doc) {
        return next(new AppError(`Module could not be created`, 400))
    }

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('Module', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc,
    })
})

export const getModules = getAll(Module)

export const getModuleById = getOne(Module)

export const updateModule = updateOne(Module)

export const deleteModule = deleteOne(Module)
