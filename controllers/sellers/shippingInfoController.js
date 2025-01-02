import redisClient from '../../config/redisConfig.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../../factory/handleFactory.js'
import ShippingInfo from '../../models/sellers/shippingInfoModel.js'
import { deleteKeysByPattern } from '../../services/redisService.js'
import AppError from '../../utils/appError.js'
import catchAsync from '../../utils/catchAsync.js'
import { getCacheKey } from '../../utils/helpers.js'

export const createShippingInfo = catchAsync(async (req, res, next) => {
    const { vendorId, pickingAddressId, originCityId, shippingMethod } =
        req.body

    const newData = {
        vendorId,
        pickingAddressId,
        pickingAddressId,
        originCityId,
        shippingMethod,
    }

    const doc = await ShippingInfo.create(newData)

    if (!doc) {
        return next(new AppError(`Shipping info could not be created`, 400))
    }

    // delete all document caches related to this model
    await deleteKeysByPattern('ShippingInfo')

    res.status(201).json({
        status: 'success',
        doc,
    })
})

export const getAllShippingInfo = getAll(ShippingInfo)

export const getShippingInfoById = getOne(ShippingInfo)

export const getShippingInfoByVendorId = catchAsync(async (req, res, next) => {
    const vendorId = req.params.vendorId

    // Check cache first
    const cacheKey = getCacheKey('ShippingInfo', vendorId)
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    const doc = await ShippingInfo.findOne({ vendorId })

    if (!doc) {
        return next(
            new AppError(
                `No Shipping information found with that vendor ID`,
                404
            )
        )
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc,
    })
})

export const deleteShippingInfo = deleteOne(ShippingInfo)

export const updateShippingInfo = updateOne(ShippingInfo)
