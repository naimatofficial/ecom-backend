import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updatePublishStatus,
    updateStatus,
} from '../../../factory/handleFactory.js'
import Product from '../../../models/sellers/productModel.js'
import redisClient from '../../../config/redisConfig.js'
import { getCacheKey } from '../../../utils/helpers.js'
import AppError from '../../../utils/appError.js'
import catchAsync from '../../../utils/catchAsync.js'
import FlashDeal from '../../../models/admin/deals/flashDealModel.js'
import APIFeatures from '../../../utils/apiFeatures.js'
import mongoose from 'mongoose'

const checkExpiration = (flashDeal) => {
    const currentDate = new Date()
    const endDate = new Date(flashDeal.endDate)
    return currentDate > endDate
}

// Create Flash Deal
export const createFlashDeal = createOne(FlashDeal)
// Get Flash Deals with Caching
export const getFlashDeals = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('FlashDeal', '', req.query)
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        const cachedData = JSON.parse(cachedDoc)
        return res.status(200).json({
            status: 'success',
            cached: true,
            results: cachedData.deals.length,
            doc: cachedData,
        })
    }

    // Query flash deals
    let query = FlashDeal.find().lean()
    const features = new APIFeatures(query, req.query)
        .filter()
        .sort()
        .fieldsLimit()
        .paginate()

    const deals = await features.query

    if (!deals || deals.length === 0) {
        return next(new AppError('No flash deals found', 404))
    }

    // Fetch associated products
    const productIds = deals.flatMap((deal) => deal.products.map((p) => p))
    const products = await Product.find({ _id: { $in: productIds } }).lean()

    // Map products to their IDs for quick lookup
    const productMap = new Map(products.map((p) => [p._id.toString(), p]))

    // Enrich deals with full product details
    const flashDeals = deals.map((deal) => ({
        ...deal,
        products: deal.products.map(
            (productId) => productMap.get(productId.toString()) || productId
        ),
    }))

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(flashDeals))

    res.status(200).json({
        status: 'success',
        cached: false,
        results: flashDeals.length,
        doc: flashDeals,
    })
})

export const getLatestFlashDeal = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('FlashDeal', 'latest', req.query)
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        const cachedData = JSON.parse(cachedDoc)
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: cachedData,
        })
    }

    // Query to find the latest active flash deal
    const latestDeal = await FlashDeal.findOne({ status: 'active' })
        .sort({ startDate: -1 }) // Sort by latest start date
        .lean()

    if (!latestDeal) {
        return next(new AppError('No active flash deals found', 404))
    }

    // Validate and convert product IDs to ObjectId
    const validProductIds = latestDeal.products
        ?.filter((id) => mongoose.Types.ObjectId.isValid(id)) // Filter valid IDs
        .map((id) => mongoose.Types.ObjectId(id)) // Convert to ObjectId

    if (!validProductIds || validProductIds.length === 0) {
        return next(
            new AppError('No valid products found for this flash deal', 404)
        )
    }

    // Fetch products
    const products = await Product.find({
        _id: { $in: validProductIds },
    }).lean()

    // Enrich flash deal with product details
    const enrichedDeal = {
        ...latestDeal,
        products,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(enrichedDeal))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc: enrichedDeal,
    })
})

// Get Flash Deal by ID

export const getFlashDealById = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('FlashDeal', req.params.id)

    // Check cache first
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    // If not in cache, fetch from database
    let doc = await FlashDeal.findById(req.params.id).lean()

    if (!doc) {
        return next(new AppError(`No flash deal found with that ID`, 404))
    }

    let products = await Product.find({
        _id: { $in: doc.products },
    }).lean()

    // If no reviews are found, initialize with an empty array
    if (!products || products.length === 0) {
        products = []
    }

    // Add reviews (empty array if none found)
    doc = {
        ...doc,
        products,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc,
    })
})

export const updateFlashDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const updatedFlashDeal = await FlashDeal.findByIdAndUpdate(id, req.body, {
        new: true,
    }).exec()

    if (!updatedFlashDeal) {
        return next(new AppError('Flash deal not found', 404))
    }

    if (checkExpiration(updatedFlashDeal)) {
        updatedFlashDeal.status = 'expired'
        await updatedFlashDeal.save()
    }

    const cacheKey = getCacheKey('FlashDeal', '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedFlashDeal,
    })
})

// Delete Flash Deal
export const deleteFlashDeal = deleteOne(FlashDeal)
// Add Product to Flash Deal
export const addProductToFlashDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { productId } = req.body

    // Check if the product exists
    const product = await Product.findById(productId)
    if (!product) {
        return next(new AppError('Product not found', 404))
    }

    const flashDeal = await FlashDeal.findById(id)
    if (!flashDeal) {
        return next(new AppError('Flash Deal not found', 404))
    }

    // Add the product to the feature deal if it isn't already included
    if (!flashDeal.products.includes(productId)) {
        flashDeal.products.push(productId)
        await flashDeal.save()
    }

    const cacheKeyOne = getCacheKey('FlashDeal', id)
    await redisClient.del(cacheKeyOne)

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('FlashDeal', '')
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc: flashDeal,
    })
})

export const removeProductFromFlashDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { productId } = req.body

    const product = await Product.findById(productId)
    if (!product) {
        return next(new AppError('Product not found', 404))
    }

    const flashDeal = await FlashDeal.findById(id)
    if (!flashDeal) {
        return next(new AppError('Flash Deal not found', 404))
    }

    // Convert productId string to ObjectId
    const productObjectId = new mongoose.Types.ObjectId(productId)

    // Check if the product is part of the flash deal
    if (!flashDeal.products.some((pid) => pid.equals(productObjectId))) {
        return next(new AppError('Product not found in FlashDeal', 404))
    }

    // Remove the product from the flash deal's product list
    flashDeal.products = flashDeal.products.filter(
        (pid) => !pid.equals(productObjectId)
    )

    await flashDeal.save()

    const cacheKeyOne = getCacheKey('FlashDeal', id)
    await redisClient.del(cacheKeyOne)

    // delete all documents caches related to this model
    const cacheKey = getCacheKey('FlashDeal', '')
    await redisClient.del(cacheKey)

    res.status(204).json({
        status: 'success',
        doc: flashDeal,
    })
})

// Update Flash Deal Status
export const updateFlashDealStatus = updateStatus(FlashDeal)

// Update Publish Status of Flash Deal
export const updatePublishFlashDeal = updatePublishStatus(FlashDeal)
