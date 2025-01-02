import Wishlist from '../../models/users/wishlistModel.js'
import Product from '../../models/sellers/productModel.js'
import Customer from '../../models/users/customerModel.js'

import catchAsync from '../../utils/catchAsync.js'
import { getCacheKey } from '../../utils/helpers.js'
import redisClient from '../../config/redisConfig.js'

import { getAll } from './../../factory/handleFactory.js'
import AppError from '../../utils/appError.js'
import { deleteKeysByPattern } from '../../services/redisService.js'

export const getAllWishlists = getAll(Wishlist)

export const deleteWishlist = catchAsync(async (req, res, next) => {
    const { customerId } = req.params

    const doc = await Wishlist.findOneAndDelete({
        customer: customerId,
    }).exec()

    // Handle case where the document was not found
    if (!doc) {
        return next(new AppError(`No wishlist found with that ID`, 404))
    }

    await deleteKeysByPattern('Wishlist')

    res.status(204).json({
        status: 'success',
        doc: null,
    })
})

export const getWishlist = catchAsync(async (req, res, next) => {
    const { customerId } = req.params

    const cacheKey = getCacheKey('Wishlist', customerId)

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
    let doc = await Wishlist.findOne({ customer: customerId }).lean()

    if (!doc) {
        return next(
            new AppError(`No wishlist found with that customer ID.`, 404)
        )
    }

    let products = await Product.find({
        _id: { $in: doc.products },
    }).lean()

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

export const addProductToWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.body
    const customer = req.user._id

    const productExists = await Product.findById(productId)
    if (!productExists) {
        return next(new AppError('Product not found.', 400))
    }

    let existingCustomer = await Customer.findById(customer)
    if (!existingCustomer) {
        return next(new AppError('Customer not found.', 400))
    }

    let wishlist = await Wishlist.findOne({ customer })

    if (!wishlist) {
        wishlist = new Wishlist({
            customer,
            products: [productId],
        })
    } else {
        if (wishlist.products.includes(productId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Product already added to wishlist.',
            })
        }

        wishlist.products.push(productId)
    }

    wishlist.totalProducts = wishlist.products.length

    await wishlist.save()

    await deleteKeysByPattern('Wishlist')

    res.status(200).json({
        status: 'success',
        doc: wishlist,
    })
})

export const removeProductFromWishlist = catchAsync(async (req, res, next) => {
    const { productId } = req.params
    const customer = req.user._id

    console.log(productId)

    const wishlist = await Wishlist.findOne({ customer })

    if (!wishlist) {
        return next(new AppError('No wishlist found for this customer', 404))
    }
    const productIndex = wishlist.products.findIndex(
        (product) => product._id.toString() === productId
    )

    if (productIndex === -1) {
        return next(new AppError('Product not found in wishlist', 404))
    }

    wishlist.products.splice(productIndex, 1)

    wishlist.totalProducts = wishlist.products.length

    await wishlist.save()

    await deleteKeysByPattern('Wishlist')

    res.status(200).json({
        status: 'success',
        totalProducts: wishlist.totalProducts,
        doc: wishlist,
    })
})
