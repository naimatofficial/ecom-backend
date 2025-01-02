import Refund from '../../models/transactions/refundModel.js'
import Order from '../../models/transactions/orderModel.js'

import { deleteOne, getAll, getOne } from '../../factory/handleFactory.js'
import catchAsync from '../../utils/catchAsync.js'
import { getCacheKey } from '../../utils/helpers.js'
import redisClient from '../../config/redisConfig.js'
import AppError from '../../utils/appError.js'
import Joi from 'joi'

// Create a new refund request
export const createRefund = catchAsync(async (req, res, next) => {
    const { reason, order } = req.body

    const refund = await Refund.create({ order, reason })

    if (!refund) {
        return next(new AppError(`Refund could not be created`, 400))
    }

    const cacheKeyOne = getCacheKey('Refund', refund?._id)
    await redisClient.setEx(cacheKeyOne, 3600, JSON.stringify(refund))

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('Refund', '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: refund,
    })
})

export const getAllRefunds = getAll(Refund)

// Get refund by ID
export const getRefundById = getOne(Refund)

// Define Joi validation schema
const refundUpdateSchema = Joi.object({
    status: Joi.string()
        .valid('pending', 'approved', 'refunded', 'rejected')
        .default('pending')
        .messages({
            'string.base': 'Status must be a string.',
            'any.only':
                'Status must be one of the following values: pending, approved, refunded, rejected.',
        }),
    statusReason: Joi.string().optional().allow(null, '').messages({
        'string.base': 'Status reason must be a string.',
    }),
})

// Update a refund status
export const updateRefundStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const { error } = refundUpdateSchema.validate(req.body)
    if (error) {
        return next(new AppError(error.details[0].message, 400))
    }

    const refund = await Refund.findById(id)

    if (!refund) {
        return next(new AppError('No refund found with that ID', 404))
    }

    const updatedRefund = {
        status: req.body.status || refund.status,
        statusReason: req.body.statusReason || refund.statusReason,
    }

    const doc = await Refund.findByIdAndUpdate(id, updatedRefund, {
        new: true,
        runValidators: true,
    })

    // Update cache
    const cacheKey = getCacheKey(Refund, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc,
    })
})

// Delete a refund
export const deleteRefund = deleteOne(Refund)
