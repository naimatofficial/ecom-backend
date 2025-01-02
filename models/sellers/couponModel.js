import mongoose from 'mongoose'
import AppError from '../../utils/appError.js'
import { adminDbConnection } from '../../config/dbConnections.js'
import Vendor from './vendorModel.js'
import Customer from '../users/customerModel.js'

// Define the coupon schema
const couponSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide Title.'],
            trim: true,
        },
        code: {
            type: String,
            required: [true, 'Please provide Coupon Code.'],
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            enum: [
                'discount-on-purchase',
                'free-delivery',
                'buy-one-get-one',
                'others',
            ],
            required: [true, 'Please provide type.'],
        },
        userLimit: {
            limit: {
                type: Number,
                // required: [true, "Please provide a limit for user."],
                min: [1, 'Limit must be at least 1.'],
            },
            used: {
                type: Number,
                default: 0,
                min: [0, 'Used count cannot be less than 0.'],
            },
        },
        couponBearer: {
            type: String,
            enum: ['vendor', 'admin'],
            required: [true, 'Please provide Coupon Bearer.'],
        },
        discountType: {
            type: String,
            enum: ['amount', 'percentage'],
            required: [true, 'Please provide Discount Type.'],
        },
        discountAmount: {
            type: Number,
            required: [true, 'Please provide Discount Amount.'],
            min: [0, 'Discount Amount cannot be negative.'],
        },
        minPurchase: {
            type: Number,
            required: [true, 'Please provide minimum purchase amount.'],
            min: [0, 'Minimum Purchase cannot be negative.'],
        },
        maxDiscount: {
            type: Number,
            min: [0, 'Maximum Discount cannot be negative.'],
        },
        startDate: {
            type: Date,
            required: [true, 'Please provide Start Date.'],
        },
        expiredDate: {
            type: Date,
            required: [true, 'Please provide Expired Date.'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        vendors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Vendor',
                required: true, // Ensures a vendor is required
            },
        ],
        customers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Customer',
                required: true,
            },
        ],
        createdBy: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

// Pre-find hook for populating vendors and customers
// couponSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "vendors",
//     select: "shopName", // Select fields to return
//   }).populate({
//     path: "customers",
//     select: "firstName lastName", // Select fields to return
//   });

//   next();
// });

// Pre-save hook for checking vendor and customer existence
couponSchema.pre('save', async function (next) {
    try {
        // Validate vendor references
        if (this.vendors && this.vendors.length > 0) {
            const vendorCheck = await Vendor.countDocuments({
                _id: { $in: this.vendors },
            })

            if (vendorCheck !== this.vendors.length) {
                return next(
                    new AppError('One or more vendors do not exist.', 400)
                )
            }
        }

        // Validate customer references
        if (this.customers && this.customers.length > 0) {
            const customerCheck = await Customer.countDocuments({
                _id: { $in: this.customers },
            })

            if (customerCheck !== this.customers.length) {
                return next(
                    new AppError('One or more customers do not exist.', 400)
                )
            }
        }

        next()
    } catch (err) {
        next(err)
    }
})

// Create and export the Coupon model
const Coupon = adminDbConnection.model('Coupon', couponSchema)
export default Coupon
