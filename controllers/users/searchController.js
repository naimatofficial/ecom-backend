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

    // // Fetch active brands
    // const brands = await Brand.find({
    //     name: searchRegex,
    //     // status: 'active',
    // }).select('name logo status')

    // // Fetch active categories
    // const categories = await Category.find({
    //     name: searchRegex,
    //     // status: 'active',
    // }).select('name status')

    // Fetch approved products
    const products = await Product.find({
        name: searchRegex,
        approved: true,
    })
        .populate('category', 'name')
        .populate('brand', 'name')
        .select('name price stock status')

    const searchResults = {
        // brands,
        // categories,
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

// export const searchAll = catchAsync(async (req, res, next) => {
//     const { query, limit = 5, page = 1 } = req.query

//     if (!query) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Search query is required',
//         })
//     }

//     const offset = (page - 1) * limit
//     const cacheKey = `cache:Search:${query}:${page}:${limit}`

//     // Check Redis cache
//     const cachedResults = await redisClient.get(cacheKey)
//     if (cachedResults) {
//         return res.status(200).json({
//             ...JSON.parse(cachedResults),
//             status: 'success',
//             cached: true,
//         })
//     }

//     try {
//         // MongoDB Aggregation for search
//         const results = await Promise.all([
//             // Search products
//             Product.aggregate([
//                 {
//                     $match: {
//                         name: { $regex: query, $options: 'i' },
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: 'categories', // Name of the `categories` collection
//                         localField: 'category',
//                         foreignField: '_id',
//                         as: 'category',
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: 'brands', // Name of the `brands` collection
//                         localField: 'brand',
//                         foreignField: '_id',
//                         as: 'brand',
//                     },
//                 },
//                 {
//                     $project: {
//                         name: 1,
//                         description: 1,
//                         slug: 1,
//                         thumbnail: 1,
//                         category: { $arrayElemAt: ['$category.name', 0] },
//                         brand: { $arrayElemAt: ['$brand.name', 0] },
//                     },
//                 },
//                 { $skip: offset },
//                 { $limit: parseInt(limit, 10) },
//             ]),

//             // Search brands
//             Brand.aggregate([
//                 {
//                     $match: {
//                         name: { $regex: query, $options: 'i' },
//                     },
//                 },
//                 {
//                     $project: {
//                         name: 1,
//                         slug: 1,
//                     },
//                 },
//                 { $skip: offset },
//                 { $limit: parseInt(limit, 10) },
//             ]),

//             // Search categories
//             Category.aggregate([
//                 {
//                     $match: {
//                         name: { $regex: query, $options: 'i' },
//                     },
//                 },
//                 {
//                     $project: {
//                         name: 1,
//                         slug: 1,
//                     },
//                 },
//                 { $skip: offset },
//                 { $limit: parseInt(limit, 10) },
//             ]),
//         ])

//         const [products, brands, categories] = results

//         // Combine results
//         const combinedResults = [
//             ...products.map((product) => ({ type: 'product', ...product })),
//             ...brands.map((brand) => ({ type: 'brand', ...brand })),
//             ...categories.map((category) => ({
//                 type: 'category',
//                 ...category,
//             })),
//         ]

//         const response = {
//             status: 'success',
//             cached: false,
//             totalResults: combinedResults.length,
//             results: combinedResults,
//         }

//         // Cache the response
//         await redisClient.setEx(cacheKey, 3600, JSON.stringify(response))

//         res.status(200).json(response)
//     } catch (error) {
//         return next(error) // Pass errors to your global error handler
//     }
// })
export const searchProductSuggestions = catchAsync(async (req, res, next) => {
    const { query, limit = 10, page = 1 } = req.query

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
        const results = await // Search products
        Product.aggregate([
            {
                $match: {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                    ],
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
                    category: { $arrayElemAt: ['$category.name', 0] },
                    brand: { $arrayElemAt: ['$brand.name', 0] },
                },
            },
            { $skip: offset },
            { $limit: parseInt(limit, 10) },
        ])

        const response = {
            status: 'success',
            cached: false,
            totalResults: results.length,
            results,
        }

        // Cache the response
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response))

        res.status(200).json(response)
    } catch (error) {
        return next(error) // Pass errors to your global error handler
    }
})

export const searchProducts = catchAsync(async (req, res, next) => {
    const { query = '', limit = 10, page = 1, sort = '-createdAt' } = req.query

    console.log(req.query)

    if (!query) {
        return res.status(400).json({
            status: 'fail',
            message: 'Search query is required',
        })
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1) // Ensure page is at least 1
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 1, 1), 50) // Ensure limit is between 1 and 50
    const offset = (pageNum - 1) * limitNum
    const cacheKey = `cache:Search:${query}:${page}:${limit}:${sort}`

    try {
        // Check Redis Cache
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

    try {
        // MongoDB Aggregation for search
        const pipeline = [
            {
                $match: {
                    $or: [
                        { name: { $regex: query, $options: 'i' } },
                        { description: { $regex: query, $options: 'i' } },
                    ],
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
                $addFields: {
                    category: { $arrayElemAt: ['$category.name', 0] },
                    brand: { $arrayElemAt: ['$brand.name', 0] },
                },
            },
            {
                $sort: {
                    [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1,
                },
            },
            { $skip: offset },
            { $limit: limitNum },
        ]

        // Count total documents without pagination
        const countPipeline = [...pipeline]
        countPipeline.splice(-2, 2) // Remove `$skip` and `$limit` stages
        countPipeline.push({ $count: 'totalResults' })

        const [results, countResult] = await Promise.all([
            Product.aggregate(pipeline),
            Product.aggregate(countPipeline),
        ])

        console.log({ results })

        const totalResults =
            countResult.length > 0 ? countResult[0].totalResults : 0
        const totalPages = Math.ceil(totalResults / limitNum)

        const response = {
            status: 'success',
            cached: false,
            totalResults,
            totalPages,
            currentPage: pageNum,
            results,
        }

        // Cache the response
        try {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(response)) // Cache for 1 hour
        } catch (err) {
            console.error('Redis caching error:', err)
        }

        res.status(200).json(response)
    } catch (error) {
        console.error('Aggregation error:', error)
        next(error) // Pass errors to the global error handler
    }
})
