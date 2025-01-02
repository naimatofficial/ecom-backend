import mongoose from 'mongoose'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
    updateStatus,
} from '../../../factory/handleFactory.js'
import FeaturedDeal from '../../../models/admin/deals/featuredDealModel.js'
import Product from '../../../models/sellers/productModel.js'
import catchAsync from '../../../utils/catchAsync.js'
import { getCacheKey } from '../../../utils/helpers.js'
import redisClient from '../../../config/redisConfig.js'
import AppError from '../../../utils/appError.js'
import { deleteKeysByPattern } from '../../../services/redisService.js'

// Create Feature Deal
export const createFeaturedDeal = createOne(FeaturedDeal)

// Get Feature Deals
export const getFeaturedDeals = getAll(FeaturedDeal)

// Get Feature Deal by ID
export const getFeaturedDealById = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('FeaturedDeal', req.params.id)

    const cachedDoc = await redisClient.get(cacheKey)

    if (cachedDoc) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            doc: JSON.parse(cachedDoc),
        })
    }

    let doc = await FeaturedDeal.findById(req.params.id).lean()

    if (!doc) {
        return next(new AppError(`No featured deal found with that ID`, 404))
    }

    let products = await Product.find({
        _id: { $in: doc.products },
    }).lean()

    if (!products || products.length === 0) {
        products = []
    }

    doc = {
        ...doc,
        products: products,
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc,
    })
})

// Update Feature Deal
export const updateFeaturedDeal = updateOne(FeaturedDeal)
// Add Product to Feature Deal
export const addProductToFeaturedDeal = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const { productId } = req.body

    // Check if the product exists
    const product = await Product.findById(productId)
    if (!product) {
        return next(new AppError('Product not found', 404))
    }

    const featuredDeal = await FeaturedDeal.findById(id)

    if (!featuredDeal) {
        return next(new AppError('Feature Deal not found', 404))
    }

    // Add the product to the feature deal if it isn't already included
    if (!featuredDeal.products.includes(productId)) {
        featuredDeal.products.push(productId)
        await featuredDeal.save()
    }

    await deleteKeysByPattern('FeaturedDeal')

    res.status(201).json({
        status: 'success',
        doc: featuredDeal,
    })
})

// Remove Product from Feature Deal
export const removeProductFromFeaturedDeal = catchAsync(
    async (req, res, next) => {
        const { id } = req.params
        const { productId } = req.body

        const product = await Product.findById(productId)
        if (!product) {
            return next(new AppError('Product not found', 404))
        }

        const featuredDeal = await FeaturedDeal.findById(id)
        if (!featuredDeal) {
            return next(new AppError('Feature Deal not found', 404))
        }

        // Convert productId string to ObjectId
        const productObjectId = new mongoose.Types.ObjectId(productId)

        // Check if the product is part of the featured deal
        if (!featuredDeal.products.some((pid) => pid.equals(productObjectId))) {
            return next(new AppError('Product not found in Featured Deal', 404))
        }

        // Remove the product from the featured deal's product list
        featuredDeal.products = featuredDeal.products.filter(
            (pid) => !pid.equals(productObjectId)
        )

        await featuredDeal.save()

        await deleteKeysByPattern('FeaturedDeal')

        res.status(204).json({
            status: 'success',
            doc: featuredDeal,
        })
    }
)

// Update Feature Deal Status
export const updateFeaturedDealStatus = updateStatus(FeaturedDeal)

// Delete Feature Deal
export const deleteFeaturedDeal = deleteOne(FeaturedDeal)
