import slugify from 'slugify'
import Brand from '../../models/admin/brandModel.js'
import catchAsync from '../../utils/catchAsync.js'

import { getCacheKey } from '../../utils/helpers.js'
import redisClient from '../../config/redisConfig.js'
import APIFeatures from '../../utils/apiFeatures.js'

import { createOne, updateStatus } from '../../factory/handleFactory.js'
import Product from '../../models/sellers/productModel.js'
import Order from '../../models/transactions/orderModel.js'
import AppError from '../../utils/appError.js'
import { deleteKeysByPattern } from '../../services/redisService.js'

// Create a new brand
export const createBrand = createOne(Brand)

export const getBrands = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('Brand', '', req.query)

    // Check cache first
    const cacheddoc = await redisClient.get(cacheKey)

    if (cacheddoc !== null) {
        return res.status(200).json({
            status: 'success',
            cached: true,
            results: JSON.parse(cacheddoc).length,
            doc: JSON.parse(cacheddoc),
        })
    }

    // EXECUTE QUERY
    let query = Brand.find()

    const features = new APIFeatures(query, req.query)
        .filter()
        .sort()
        .fieldsLimit()
        .paginate()

    // Fetch all brands
    const brands = await features.query.lean()

    // Fetch products and total orders for each brand
    const brandsWithProductsAndOrders = await Promise.all(
        brands.map(async (brand) => {
            // Step 1: Fetch all products for the brand
            const products = await Product.find({
                brand: brand._id,
                status: 'approved',
            })
                .select('_id')
                .lean()

            const totalProducts = products?.length || 0

            // Step 2: Extract product IDs
            const productIds = products.map((product) => product._id)

            // Step 3: Count the total number of orders for these products
            const totalOrders = await Order.countDocuments({
                products: { $in: productIds }, // Match orders that contain any of the product IDs
            }).lean()

            // Step 4: Add products and totalOrders to the brand object
            return {
                ...brand,
                totalOrders, // Total number of orders for these products
                totalProducts,
            }
        })
    )

    // Cache the result
    await redisClient.setEx(
        cacheKey,
        3600,
        JSON.stringify(brandsWithProductsAndOrders)
    )

    res.status(200).json({
        status: 'success',
        cached: false,
        results: brandsWithProductsAndOrders.length,
        doc: brandsWithProductsAndOrders,
    })
})

// Get a brand by ID
export const getBrandById = catchAsync(async (req, res, next) => {
    const brandId = req.params.id
    const cacheKey = getCacheKey('Brand', brandId)

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
    let doc = await Brand.findById(brandId).lean()

    if (!doc) {
        return next(new AppError(`No brand found with that ID`, 404))
    }

    // Step 1: Fetch total products for the brand
    const products = await Product.find({
        brand: brand._id,
        status: 'approved',
    })
        .select('_id')
        .lean()

    const totalProducts = products?.length || 0

    // Extract product IDs from the products
    const productIds = products.map((product) => product._id)

    // Step 3: Fetch total orders that contain these products
    const totalOrders = await Order.countDocuments({
        products: { $in: productIds }, // Match orders that contain any of the product IDs
    }).lean()

    doc = {
        ...doc,
        totalProducts,
        totalOrders,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc,
    })
})

export const getBrandBySlug = catchAsync(async (req, res, next) => {
    const slug = req.params.slug
    const cacheKey = getCacheKey('Brand', slug)

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
    let doc = await Brand.findOne({ slug }).lean()

    if (!doc) {
        return next(new AppError(`No brand found with that slug`, 404))
    }

    const brandId = doc?._id

    // Step 1: Fetch total products for the brand
    const products = await Product.find({
        brand: brandId,
        status: 'approved',
    })
        .select('_id')
        .lean()

    const totalProducts = products?.length || 0

    // Extract product IDs from the products
    const productIds = products.map((product) => product._id)

    // Step 3: Fetch total orders that contain these products
    const totalOrders = await Order.countDocuments({
        products: { $in: productIds }, // Match orders that contain any of the product IDs
    }).lean()

    doc = {
        ...doc,
        totalProducts,
        totalOrders,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(doc))

    res.status(200).json({
        status: 'success',
        cached: false,
        doc,
    })
})

// Update a brand by ID
export const updateBrand = catchAsync(async (req, res) => {
    const { name, imageAltText, logo } = req.body

    const doc = await Brand.findByIdAndUpdate(
        req.params.id,
        {
            name,
            logo,
            imageAltText,
            slug: slugify(filteredData.name, { lower: true }),
        },
        { new: true }
    )

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError('No document found with that ID', 404))
    }

    // Update cache
    await deleteKeysByPattern('Brand')
    await deleteKeysByPattern('Search')

    res.status(200).json({
        status: 'success',
        doc,
    })
})

// Delete a brand by ID
export const deleteBrand = catchAsync(async (req, res, next) => {
    // Delete the brand document
    const brand = await Brand.findByIdAndDelete(req.params.id).exec()

    // Handle case where the brand was not found
    if (!brand) {
        return next(new AppError(`No brand found with that ID`, 404))
    }

    // Delete all products associated with this brand
    await Product.deleteMany({ brand: req.params.id }).exec()

    await deleteKeysByPattern('Brand')
    await deleteKeysByPattern('Product')
    await deleteKeysByPattern('Search')

    res.status(204).json({
        status: 'success',
        doc: null,
    })
})

// Update a brand's status by ID
export const updateBrandStatus = updateStatus(Brand)
