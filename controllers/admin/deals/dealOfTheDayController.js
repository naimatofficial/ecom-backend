import DealOfTheDay from '../../../models/admin/deals/dealOfTheDayModel.js'
import {
    createOne,
    updateOne,
    deleteOne,
} from '../../../factory/handleFactory.js'
import Product from '../../../models/sellers/productModel.js'
import catchAsync from '../../../utils/catchAsync.js'
import { getCacheKey } from '../../../utils/helpers.js'
import redisClient from '../../../config/redisConfig.js'
import AppError from '../../../utils/appError.js'
import { Types } from 'mongoose'

// Create a Deal of the Day
export const createDealOfTheDay = createOne(DealOfTheDay)

export const getAllDealsOfTheDay = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('DealOfTheDay')
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    // Fetch deals
    let deals
    try {
        deals = await DealOfTheDay.find().lean()
        if (!deals || deals.length === 0) {
            return next(new AppError('No Deals of the Day found', 404))
        }
    } catch (error) {
        return next(
            new AppError('Failed to fetch deals from the database', 500)
        )
    }

    // Extract valid product IDs
    const productIds = deals
        .map((deal) => deal.product)
        .filter((id) => Types.ObjectId.isValid(id))

    // Fetch all associated products in one go
    let products = []
    try {
        products = await Product.find({ _id: { $in: productIds } }).lean()
    } catch (error) {
        console.error('Failed to fetch products:', error)
    }

    // Map products to their respective deals
    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product
        return map
    }, {})

    const enrichedDeals = deals.map((deal) => ({
        ...deal,
        products: productMap[deal.product] ? [productMap[deal.product]] : [],
    }))

    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(enrichedDeals), 'EX', 3600)

    // Return the response
    res.status(200).json({
        status: 'success',
        cached: false,
        doc: enrichedDeals,
    })
})

export const getSingleDealOfTheDay = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('DealOfTheDay')
    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    // Fetch the latest active deal of the day
    let deal
    try {
        deal = await DealOfTheDay.findOne({ status: 'active' }) // Filter by status
            .sort({ createdAt: -1 }) // Sort by creation date in descending order
            .lean()

        if (!deal) {
            return next(new AppError('No active Deal of the Day found', 404))
        }
    } catch (error) {
        return next(new AppError('Failed to fetch deal from the database', 500))
    }

    // Fetch the associated product
    let product
    if (Types.ObjectId.isValid(deal.product)) {
        product = await Product.findById(deal.product).lean()
    }

    if (!product) {
        return next(new AppError('No product found by that ID', 404))
    }

    // Enrich the deal with product data
    const enrichedDeal = {
        ...deal,
        product: product ? product : {},
    }

    // Cache the result
    await redisClient.set(cacheKey, JSON.stringify(enrichedDeal), 'EX', 3600)

    // Return the response
    res.status(200).json({
        status: 'success',
        cached: false,
        doc: enrichedDeal,
    })
})

export const getDealOfTheDayById = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('DealOfTheDay', req.params.id)

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
    let doc = await DealOfTheDay.findById(req.params.id).lean()

    if (!doc) {
        return next(new AppError(`No Deal Of The Day found with that ID`, 404))
    }

    // Fetch associated products using product IDs in the Deal of the Day document
    let product = await Product.findById(doc.product).lean()

    // If no products are found, initialize with an empty array
    if (!product) {
        product = doc.product
    }

    // Add products to the Deal of the Day document
    doc = {
        ...doc,
        product,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc,
    })
})

// Update Deal of the Day
export const updateDealOfTheDay = updateOne(DealOfTheDay)
// Delete Deal of the Day
export const deleteDealOfTheDay = deleteOne(DealOfTheDay)
