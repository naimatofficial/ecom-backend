import Coupon from '../../models/sellers/couponModel.js'
import Customer from '../../models/users/customerModel.js'

import redisClient from '../../config/redisConfig.js'
import catchAsync from '../../utils/catchAsync.js'
import APIFeatures from '../../utils/apiFeatures.js'
import { getCacheKey } from '../../utils/helpers.js'

import {
    getAll,
    getOne,
    updateOne,
    updateStatus,
    deleteOne,
    createOne,
} from '../../factory/handleFactory.js'
import Vendor from '../../models/sellers/vendorModel.js'
import { deleteKeysByPattern } from '../../services/redisService.js'

// Create a new coupon
// export const createCoupon = createOne(Coupon);

// Create Coupon
export const createCoupon = catchAsync(async (req, res, next) => {
    const {
        title,
        code,
        type,
        userLimit,
        couponBearer,
        discountType,
        discountAmount,
        minPurchase,
        maxDiscount,
        startDate,
        expiredDate,
        vendors,
        customers,
    } = req.body

    const createdBy = req.user?.id

    // Create the coupon document
    const newCoupon = new Coupon({
        title,
        code,
        type,
        userLimit,
        couponBearer,
        discountType,
        discountAmount,
        minPurchase,
        maxDiscount,
        startDate,
        expiredDate,
        vendors,
        customers,
        createdBy,
    })

    // Save the coupon to the database
    await newCoupon.save()

    if (!newCoupon) {
        return next(new AppError('Coupon could not be created', 400))
    }

    // delete all document caches related to this model
    await deleteKeysByPattern('Coupon')

    // Return the created coupon
    res.status(201).json({
        status: 'success',
        doc: newCoupon,
    })
})

// Get all coupons
export const getAllCoupons = getAll(Coupon)
// Controller for getting all coupons with vendor and customer details

// Get a single coupon

export const getCouponById = getOne(Coupon)
// Update a coupon by ID
export const updateCoupon = updateOne(Coupon)

// Update coupon status by ID
export const updateCouponStatus = updateStatus(Coupon)

// Delete a coupon by ID
export const deleteCoupon = deleteOne(Coupon)
