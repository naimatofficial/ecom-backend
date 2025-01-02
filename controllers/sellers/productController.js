import catchAsync from '../../utils/catchAsync.js'
import { getAll, updateStatus, deleteOne } from '../../factory/handleFactory.js'
import { getCacheKey } from '../../utils/helpers.js'
import redisClient from '../../config/redisConfig.js'
import slugify from 'slugify'
import AppError from '../../utils/appError.js'

import Product from '../../models/sellers/productModel.js'
import Vendor from '../../models/sellers/vendorModel.js'
import Brand from '../../models/admin/brandModel.js'
import Category from '../../models/admin/categories/categoryModel.js'
import ProductReview from '../../models/users/productReviewModel.js'
import Order from '../../models/transactions/orderModel.js'
import Employee from '../../models/admin/employeeModel.js'
import { deleteKeysByPattern } from '../../services/redisService.js'
import APIFeatures from '../../utils/apiFeatures.js'
import SubCategory from '../../models/admin/categories/subCategoryModel.js'
import ShippingInfo from '../../models/sellers/shippingInfoModel.js'

// Create a new product
export const createProduct = catchAsync(async (req, res, next) => {
    let {
        name,
        subDepartment,
        region,
        description,
        category,
        subCategory,
        subSubCategory,
        brand,
        productType,
        digitalProductType,
        sku,
        unit,
        weight,
        tags,
        price,
        discount,
        discountType,
        discountAmount,
        taxAmount,
        taxIncluded,
        minimumOrderQty,
        shippingCost,
        stock,
        colors,
        thumbnail,
        images,
        attributes,
        videoLink,
        metaTitle,
        metaDescription,
        userId,
        userType,
    } = req.body

    if (userType === 'vendor') {
        const user = await Vendor.findById(userId)
        if (!user) {
            return next(new AppError('Referenced vendor does not exist', 400))
        }
    } else if (userType === 'in-house') {
        const user = await Employee.findById(userId)
        if (!user) {
            return next(new AppError('Referenced user does not exist', 400))
        }
    } else {
        return next(new AppError('Invalid userType provided', 400))
    }

    // Calculate updated discount amount
    discountAmount =
        discountType === 'percent' ? (price * discount) / 100 : discountAmount

    let productData = {
        name,
        subDepartment,
        region,
        description,
        category,
        subCategory,
        subSubCategory,
        brand,
        productType,
        sku,
        unit,
        weight,
        tags,
        price,
        discount,
        discountType,
        discountAmount,
        taxAmount,
        taxIncluded,
        minimumOrderQty,
        shippingCost,
        stock,
        thumbnail,
        images,
        colors,
        attributes,
        videoLink,
        userId,
        userType,
        metaTitle,
        metaDescription,
        slug: slugify(name, { lower: true }),
    }

    if (productType === 'digital') {
        productData = {
            ...productData,
            digitalProductType,
        }
    }

    const newProduct = new Product(productData)

    await newProduct.save()

    // Increment the vendor's totalProducts count
    const vendor = await Vendor.findById(userId)

    if (!vendor) {
        return next(new AppError('Vendor not found!', 404))
    }

    // Increment vendor products count when creating an product
    await Vendor.findByIdAndUpdate(vendor, {
        $inc: { totalProducts: 1 },
    })

    // delete all document caches related to this model
    await deleteKeysByPattern('Product')
    await deleteKeysByPattern('Search')
    await deleteKeysByPattern('Vendor')

    res.status(201).json({
        status: 'success',
        doc: newProduct,
    })
})

export const getAllProducts = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('Product', '', req.query)

    // Check cache first
    const cachedResults = await redisClient.get(cacheKey)
    if (cachedResults) {
        return res.status(200).json({
            ...JSON.parse(cachedResults),
            status: 'success',
            cached: true,
        })
    }

    const { sort, limit, page = 1, ...filters } = req.query

    // Apply query options (pagination, sorting, filters)
    const hasQueryOptions =
        sort || limit || page || Object.keys(filters).length > 0
    let totalDocs = 0
    let doc = []

    if (hasQueryOptions) {
        const features = new APIFeatures(Product.find(), req.query)
            .filter()
            .sort()
            .fieldsLimit()

        // Step 1: Get total document count
        totalDocs = await features.query.clone().countDocuments()

        // Step 2: Apply pagination and fetch data
        features.paginate()
        doc = await features.query.lean()
    } else {
        // Fetch all documents if no query options are applied
        doc = await Product.find().lean()
        totalDocs = doc.length
    }

    // Fetch related data (from different databases) using manual queries
    const vendorIds = doc.map((product) => product.userId).filter(Boolean)
    const vendorData = await Vendor.find({ _id: { $in: vendorIds } })
        .select('firstName lastName slug shopName address')
        .lean()

    const categoryIds = doc.map((product) => product.category).filter(Boolean)
    const categoryData = await Category.find({ _id: { $in: categoryIds } })
        .select('name slug')
        .lean()

    const subCategoryIds = doc
        .map((product) => product.subCategory)
        .filter(Boolean)
    const subCategoryData = await SubCategory.find({
        _id: { $in: subCategoryIds },
    })
        .select('name slug')
        .lean()

    const brandIds = doc.map((product) => product.brand).filter(Boolean)
    const brandData = await Brand.find({ _id: { $in: brandIds } })
        .select('name slug logo')
        .lean()

    const productIds = doc.map((product) => product._id).filter(Boolean)
    const totalOrders = await Order.countDocuments({
        'products.product': { $in: productIds },
    }).lean()

    // Merge related data into the products
    doc = doc.map((product) => {
        const vendor = vendorData?.find(
            (v) => v._id.toString() === product.userId?.toString()
        )
        const category = categoryData?.find(
            (c) => c._id.toString() === product.category?.toString()
        )
        const subCategory = subCategoryData?.find(
            (c) => c._id.toString() === product.subCategory?.toString()
        )
        const brand = brandData?.find(
            (b) => b._id.toString() === product.brand?.toString()
        )

        return {
            ...product,
            vendor: vendor || null,
            category: category || null,
            subCategory: subCategory || null,
            brand: brand || null,
            totalOrders: totalOrders || 0,
        }
    })

    // Pagination details
    const currentPage = Number(page)
    const limitNum = Number(limit)
    const totalPages = limitNum ? Math.ceil(totalDocs / limitNum) : 1

    const response = {
        status: 'success',
        cached: false,
        totalDocs,
        results: doc.length,
        currentPage,
        totalPages,
        doc,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(response))

    res.status(200).send(response)
})

export const searchProducts = catchAsync(async (req, res, next) => {
    const { query } = req.query

    if (!query) {
        res.status(304).json({
            status: 'not-modified',
            message: 'Search query is required',
        })
    }

    // Use $text search for better performance with indexed search
    // const products = await Product.find({
    //     $text: { $search: search },
    // })
    //     .limit(20)
    //     .select('name description')

    // Use regex for a case-insensitive search
    const products = await Product.find({
        name: { $regex: query, $options: 'i' }, // case-insensitive search
    })
        .limit(10)
        .select(
            'name description slug thumbnail price discountAmount rating numOfReviews'
        )

    res.status(200).json({
        status: 'success',
        results: products.length,
        doc: products,
    })
})

// Update product details
export const updateProduct = catchAsync(async (req, res, next) => {
    const { id: productId } = req.params

    if (!productId) {
        return next(new AppError('Product ID is required', 400))
    }

    // Initialize the fields for update based on provided inputs
    const updateFields = {}

    // Populate `updateFields` only with provided fields
    for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
            updateFields[key] = req.body[key]
        }
    }

    // Conditionally calculate discount if required fields are provided
    if (
        updateFields.price !== undefined &&
        updateFields.discount !== undefined &&
        updateFields.discountType
    ) {
        updateFields.discountAmount =
            updateFields.discountType === 'percent'
                ? (updateFields.price * updateFields.discount) / 100
                : updateFields.discountAmount
    }

    // Set slug only if `name` is provided
    if (updateFields.name) {
        updateFields.slug = slugify(updateFields.name, { lower: true })
    }
    console.log({ updateFields })
    // Perform update with Mongoose and handle response
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateFields,
        {
            new: true,
            runValidators: true,
        }
    )

    if (!updatedProduct) {
        return next(new AppError('No product found with that ID', 404))
    }

    await deleteKeysByPattern('Product')
    await deleteKeysByPattern('Search')
    await deleteKeysByPattern('Vendor')

    res.status(200).json({
        status: 'success',
        doc: updatedProduct,
    })
})

export const getProductById = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('Product', req.params.id)

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
    let product = await Product.findById(req.params.id).lean()

    if (!product) {
        return next(new AppError(`No Product found with that Id.`, 404))
    }

    // Fetch related data, with checks for undefined/null values
    const category = product?.category
        ? await Category.findById(product.category).select('name slug').lean()
        : null
    const subCategory = product?.subCategory
        ? await SubCategory.findById(product.subCategory)
              .select('name slug')
              .lean()
        : null
    const brand = product?.brand
        ? await Brand.findById(product.brand).select('name logo slug').lean()
        : null
    const vendor = product?.userId
        ? await Vendor.findById(product.userId)
              .select('firstName lastName slug shopName address')
              .lean()
        : null
    const shippingInfo = vendor
        ? await ShippingInfo.findOne({ vendorId: vendor._id }).lean()
        : null

    // Fetch reviews for the product
    let productReviews = await ProductReview.find({
        product: product._id,
    }).lean()

    // Fetch total orders related to the product
    let totalOrders = await Order.countDocuments({
        'products.product': product._id,
    }).lean()

    // Initialize with empty array if no reviews are found
    if (!productReviews || productReviews.length === 0) {
        productReviews = []
    }

    // Add reviews, related data (vendor, category, etc.), and orders to the product
    product = {
        ...product,
        category: category || null,
        subCategory: subCategory || null,
        brand: brand || null,
        vendor: vendor || null,
        reviews: productReviews,
        totalOrders,
        shippingInfo,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product))

    // Return the response
    res.status(200).json({
        status: 'success',
        cached: false,
        doc: product,
    })
})
export const getProductBySlug = catchAsync(async (req, res, next) => {
    const cacheKey = getCacheKey('Product', req.params.slug)

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
    let product = await Product.findOne({ slug: req.params.slug }).lean()

    if (!product) {
        return next(new AppError(`No Product found with that slug`, 404))
    }

    // Fetch related data, with checks for undefined/null values
    const category = product?.category
        ? await Category.findById(product.category).select('name slug').lean()
        : null
    const subCategory = product?.subCategory
        ? await SubCategory.findById(product.subCategory)
              .select('name slug')
              .lean()
        : null
    const brand = product?.brand
        ? await Brand.findById(product.brand).select('name logo slug').lean()
        : null
    const vendor = product?.userId
        ? await Vendor.findById(product.userId)
              .select('firstName lastName slug shopName address')
              .lean()
        : null

    const shippingInfo = vendor
        ? await ShippingInfo.findOne({ vendorId: vendor._id }).lean()
        : null

    // Fetch reviews for the product
    let productReviews = await ProductReview.find({
        product: product._id,
    }).lean()

    // Fetch total orders related to the product
    let totalOrders = await Order.countDocuments({
        'products.product': product._id,
    }).lean()

    // Initialize with empty array if no reviews are found
    if (!productReviews || productReviews.length === 0) {
        productReviews = []
    }

    // Add reviews, related data (vendor, category, etc.), and orders to the product
    product = {
        ...product,
        category: category || null,
        subCategory: subCategory || null,
        brand: brand || null,
        vendor: vendor || null,
        reviews: productReviews,
        totalOrders,
        shippingInfo,
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product))

    // Return the response
    res.status(200).json({
        status: 'success',
        cached: false,
        doc: product,
    })
})

// export const getProductBySlug = catchAsync(async (req, res, next) => {
//     const cacheKey = getCacheKey('Product', req.params.slug)

//     // Check cache first
//     const cachedDoc = await redisClient.get(cacheKey)

//     if (cachedDoc) {
//         return res.status(200).json({
//             status: 'success',
//             cached: true,
//             doc: JSON.parse(cachedDoc),
//         })
//     }

//     // If not in cache, fetch from database
//     let product = await Product.findOne({ slug: req.params.slug }).lean()

//     if (!product) {
//         return next(new AppError(`No Product found with that slug`, 404))
//     }

//     const category = await Category.findById(product.category).lean()
//     const brand = await Brand.findById(product.brand).lean()

//     let productReviews = await ProductReview.find({
//         product: product._id,
//     }).lean()

//     let orders = await Order.find({
//         product: product._id,
//     }).lean()

//     // If no reviews are found, initialize with an empty array
//     if (!productReviews || productReviews.length === 0) {
//         productReviews = []
//     }

//     const totalOrders = orders?.length || 0

//     // Add reviews (empty array if none found)
//     product = {
//         ...product,
//         category,
//         brand,
//         orders,
//         reviews: productReviews,
//         totalOrders,
//     }

//     // Cache the result
//     await redisClient.setEx(cacheKey, 3600, JSON.stringify(product))

//     res.status(200).json({
//         status: 'success',
//         cached: false,
//         doc: product,
//     })
// })

// Delete a Product
export const deleteProduct = deleteOne(Product)

// Update product status
export const updateProductStatus = catchAsync(async (req, res, next) => {
    const status = req.body.status
    if (!status) {
        return next(new AppError(`Please provide status value.`, 400))
    }

    // Perform the update operation
    const doc = await Product.findByIdAndUpdate(
        req.params.id,
        { status },
        {
            new: true,
            runValidators: true,
        }
    )

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError(`No Product found with that ID`, 404))
    }

    // Increment approved count when product is approved
    if (status === 'approved') {
        await Vendor.findByIdAndUpdate(doc.userId, {
            $inc: { approvedProducts: 1 },
        })
    }

    // delete all document caches related to this model
    await deleteKeysByPattern('Product')
    await deleteKeysByPattern('Brand')
    await deleteKeysByPattern('Category')
    await deleteKeysByPattern('Vendor')

    res.status(200).json({
        status: 'success',
        doc,
    })
})

// Update product featured status
export const updateProductFeaturedStatus = catchAsync(
    async (req, res, next) => {
        const productId = req.params.id
        const { isFeatured } = req.body

        // Perform the update operation
        const doc = await Product.findByIdAndUpdate(
            productId,
            { isFeatured },
            {
                new: true,
                runValidators: true,
            }
        )

        // Handle case where the document was not found
        if (!doc) {
            return next(new AppError(`No product found with that ID`, 404))
        }

        // delete all document caches related to this model
        await deleteKeysByPattern('Product')

        res.status(200).json({
            status: 'success',
            doc,
        })
    }
)

export const bulkImportProducts = catchAsync(async (req, res, next) => {
    const { products } = req.body // Expecting an array of products
    const user = req.user

    if (!products || !Array.isArray(products) || products.length === 0) {
        return next(new AppError('Invalid or empty products array', 400))
    }

    const productsToInsert = []
    const failedProducts = []

    for (const product of products) {
        try {
            let {
                name,
                description,
                category,
                subCategory,
                subSubCategory,
                brand,
                productType,
                digitalProductType,
                sku,
                unit,
                tags,
                price,
                discount,
                discountType,
                discountAmount,
                taxAmount,
                taxIncluded,
                minimumOrderQty,
                shippingCost,
                stock,
                colors,
                thumbnail,
                images,
                attributes,
                videoLink,
                metaTitle,
                metaDescription,
                userId,
                userType,
            } = product

            if (userType === 'vendor') {
                const user = await Vendor.findById(userId)
                if (!user) {
                    throw new Error('Referenced vendor does not exist')
                }
            } else if (userType === 'in-house') {
                const user = await Employee.findById(userId)
                if (!user) {
                    throw new Error('Referenced user does not exist')
                }
            } else {
                throw new Error('Invalid userType provided')
            }

            // Calculate discount amount
            discountAmount =
                discountType === 'percent'
                    ? (price * discount) / 100
                    : discountAmount

            let productData = {
                name,
                description,
                category,
                subCategory,
                subSubCategory,
                brand,
                productType,
                sku,
                unit,
                tags,
                price,
                discount,
                discountType,
                discountAmount,
                taxAmount,
                taxIncluded,
                minimumOrderQty,
                shippingCost,
                stock,
                thumbnail,
                images,
                colors,
                attributes,
                videoLink,
                userId,
                userType,
                metaTitle,
                metaDescription,
                slug: slugify(name, { lower: true }),
            }

            if (productType === 'digital') {
                productData = { ...productData, digitalProductType }
            }

            productsToInsert.push(productData)
        } catch (error) {
            failedProducts.push({
                productName: product.name || 'Unknown',
                error: error.message,
            })
        }
    }

    if (productsToInsert.length > 0) {
        console.log(productsToInsert)
        const doc = await Product.insertMany(productsToInsert, {
            ordered: false,
        })

        console.log(doc)
        // Delete all related cache for Product
        await deleteKeysByPattern('Product')
    }

    res.status(200).json({
        status: 'success',
        message: 'Bulk import completed',
        insertedCount: productsToInsert.length,
        failedProducts,
    })
})
