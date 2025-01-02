import redisClient from '../../config/redisConfig.js'
import Brand from '../../models/admin/brandModel.js'
import Category from '../../models/admin/categories/categoryModel.js'
import Product from '../../models/sellers/productModel.js'
import APIFeatures from '../../utils/apiFeatures.js'

import AppError from '../../utils/appError.js'
import catchAsync from '../../utils/catchAsync.js'
import { getCacheKey } from '../../utils/helpers.js'

// Controller for advanced search
export const advancedSearch = catchAsync(async (req, res, next) => {
    const { query } = req.query

    if (!query) {
        return next(new AppError('Search query is required', 400))
    }

    const searchRegex = new RegExp(query, 'i')

    // Fetch active brands
    const brands = await Brand.find({
        name: searchRegex,
        // status: 'active',
    }).select('name logo status')

    // Fetch active categories
    const categories = await Category.find({
        name: searchRegex,
        // status: 'active',
    }).select('name status')

    // Fetch approved products
    const products = await Product.find({
        name: searchRegex,
        approved: true,
    })
        .populate('category', 'name')
        .populate('brand', 'name')
        .select('name price stock status')

    const searchResults = {
        brands,
        categories,
        products,
    }

    const totalResults = Object.values(searchResults).reduce(
        (acc, curr) => acc + (curr?.length || 0),
        0
    )

    console.log(totalResults)

    res.status(200).json({
        status: 'success',
        results: totalResults,
        doc: searchResults,
    })
})

export const searchAll = catchAsync(async (req, res, next) => {
    const { query, limit = 5, page = 1 } = req.query

    if (!query) {
        return res.status(400).json({
            status: 'fail',
            message: 'Search query is required',
        })
    }

    const offset = (page - 1) * limit
    const cacheKey = `cache:Search:${query}:${page}:${limit}`

    // Check Redis cache
    const cachedResults = await redisClient.get(cacheKey)
    if (cachedResults) {
        return res.status(200).json({
            ...JSON.parse(cachedResults),
            status: 'success',
            cached: true,
        })
    }

    try {
        // MongoDB Aggregation for search
        const results = await Promise.all([
            // Search products
            Product.aggregate([
                {
                    $match: {
                        name: { $regex: query, $options: 'i' },
                    },
                },
                {
                    $lookup: {
                        from: 'categories', // Name of the `categories` collection
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                {
                    $lookup: {
                        from: 'brands', // Name of the `brands` collection
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brand',
                    },
                },
                {
                    $project: {
                        name: 1,
                        description: 1,
                        slug: 1,
                        thumbnail: 1,
                        category: { $arrayElemAt: ['$category.name', 0] },
                        brand: { $arrayElemAt: ['$brand.name', 0] },
                    },
                },
                { $skip: offset },
                { $limit: parseInt(limit, 10) },
            ]),

            // Search brands
            Brand.aggregate([
                {
                    $match: {
                        name: { $regex: query, $options: 'i' },
                    },
                },
                {
                    $project: {
                        name: 1,
                        slug: 1,
                    },
                },
                { $skip: offset },
                { $limit: parseInt(limit, 10) },
            ]),

            // Search categories
            Category.aggregate([
                {
                    $match: {
                        name: { $regex: query, $options: 'i' },
                    },
                },
                {
                    $project: {
                        name: 1,
                        slug: 1,
                    },
                },
                { $skip: offset },
                { $limit: parseInt(limit, 10) },
            ]),
        ])

        const [products, brands, categories] = results

        // Combine results
        const combinedResults = [
            ...products.map((product) => ({ type: 'product', ...product })),
            ...brands.map((brand) => ({ type: 'brand', ...brand })),
            ...categories.map((category) => ({
                type: 'category',
                ...category,
            })),
        ]

        const response = {
            status: 'success',
            cached: false,
            totalResults: combinedResults.length,
            results: combinedResults,
        }

        // Cache the response
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response))

        res.status(200).json(response)
    } catch (error) {
        return next(error) // Pass errors to your global error handler
    }
})

export const searchProducts = catchAsync(async (req, res) => {
    const cacheKey = getCacheKey('cache:Search', '', req.query)

    // Check cache first
    try {
        const cachedResults = await redisClient.get(cacheKey)
        if (cachedResults) {
            return res.status(200).json({
                ...JSON.parse(cachedResults),
                status: 'success',
                cached: true,
            })
        }
    } catch (err) {
        console.error('Redis error:', err)
    }

    // Extract query parameters with safe defaults
    const {
        query = '',
        sort = '-createdAt', // Default sorting by most recent
        limit = 10,
        page = 1,
        ...filters
    } = req.query

    // Sanitize page and limit parameters
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 1, 1), 50) // Ensure limit is between 1 and 50
    const offset = (pageNum - 1) * limitNum

    // Enhance search filters with regex for name and description
    if (query) {
        filters.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
        ]
    }

    try {
        // Base query
        const baseQuery = Product.find(filters)

        // Use APIFeatures for chaining methods
        const features = new APIFeatures(baseQuery, req.query)
            .filter()
            .sort(sort)
            .fieldsLimit()

        // Count total matching documents
        const totalProducts = await features.query.clone().countDocuments()

        // Fetch products with pagination
        features.paginate(offset, limitNum)
        const products = await features.query

        // Prepare response
        const response = {
            status: 'success',
            cached: false,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNum),
            currentPage: pageNum,
            doc: products,
        }

        // Cache response
        try {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(response))
        } catch (err) {
            console.error('Redis caching error:', err)
        }

        res.status(200).json(response)
    } catch (error) {
        console.error('Search error:', error)
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        })
    }
})
