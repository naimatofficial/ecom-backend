import AppError from '../../utils/appError.js'
import catchAsync from '../../utils/catchAsync.js'
import {
    deleteOne,
    getAll,
    getOne,
    updateOne,
    updateStatus,
} from './../../factory/handleFactory.js'

import ProductReview from './../../models/users/productReviewModel.js'
import Product from '../../models/sellers/productModel.js'
import { deleteKeysByPattern } from '../../services/redisService.js'
import Vendor from '../../models/sellers/vendorModel.js'

// export const createProductReview = catchAsync(async (req, res, next) => {
//     const { productId, review, rating } = req.body
//     const userId = req.user._id

//     const existingReview = await ProductReview.findOne({
//         product: productId,
//         customer: userId,
//     })

//     if (existingReview) {
//         return next(
//             new AppError('You have already reviewed this product.', 400)
//         )
//     }

//     const productReview = await ProductReview.create({
//         product: productId,
//         customer: userId,
//         review,
//         rating,
//     })

//     if (!productReview) {
//         return next(new AppError('Rating could not be created!', 400))
//     }

//     const product = await Product.findById(productId)

//     const vendorId = product?.userId

//     const vendor = await Vendor.findById(vendorId)

//     const numOfReviews = product.numOfReviews + 1
//     const productRating = parseFloat(
//         Math.round(((product.rating + rating) / numOfReviews) * 10) / 10
//     ).toFixed(1)

//     product.numOfReviews = numOfReviews
//     product.rating = productRating

//     await product.save()

//     await deleteKeysByPattern('Product')
//     await deleteKeysByPattern('ProductReview')

//     res.status(201).json({
//         status: 'success',
//         doc: productReview,
//     })
// })

export const createProductReview = catchAsync(async (req, res, next) => {
    const { productId, review, rating } = req.body
    const userId = req.user._id

    // Step 1: Check if the user has already reviewed the product
    const existingReview = await ProductReview.findOne({
        product: productId,
        customer: userId,
    })

    if (existingReview) {
        return next(
            new AppError('You have already reviewed this product.', 400)
        )
    }

    // Step 2: Create the new product review
    const productReview = await ProductReview.create({
        product: productId,
        customer: userId,
        review,
        rating,
    })

    if (!productReview) {
        return next(new AppError('Rating could not be created!', 400))
    }

    // Step 3: Update the product's rating and number of reviews
    const product = await Product.findById(productId)

    if (!product) {
        return next(new AppError('Product not found!', 404))
    }

    const productNumOfReviews = product.numOfReviews + 1
    const productRating = parseFloat(
        (
            (product.rating * product.numOfReviews + rating) /
            productNumOfReviews
        ).toFixed(1)
    )

    product.numOfReviews = productNumOfReviews
    product.rating = productRating

    await product.save()

    // Step 4: Update the vendor's shopRating and totalReviews incrementally
    const vendorId = product.userId
    const vendor = await Vendor.findById(vendorId)

    if (!vendor) {
        return next(new AppError('Vendor not found!', 404))
    }

    const vendorTotalReviews = vendor.totalReviews + 1
    const vendorShopRating = parseFloat(
        (
            (vendor.shopRating * vendor.totalReviews + rating) /
            vendorTotalReviews
        ).toFixed(1)
    )

    vendor.totalReviews = vendorTotalReviews
    vendor.shopRating = vendorShopRating

    await vendor.save()

    // Step 5: Invalidate related cache keys
    await deleteKeysByPattern('Product')
    await deleteKeysByPattern('ProductReview')
    await deleteKeysByPattern('Vendor')

    // Step 6: Send response
    res.status(201).json({
        status: 'success',
        doc: productReview,
    })
})

export const getAllProductReviews = getAll(ProductReview)

export const updateProductReviewStatus = updateStatus(ProductReview)

// Delete an ProductReview
export const deleteProductReview = deleteOne(ProductReview)

export const updateProductReview = updateOne(ProductReview)

// Get ProductReview by ID
export const getProductReviewById = getOne(ProductReview)
