import mongoose from 'mongoose'
import Customer from './customerModel.js'

import { userDbConnection } from '../../config/dbConnections.js'
import Product from '../sellers/productModel.js'
import AppError from './../../utils/appError.js'
import { checkReferenceId } from '../../utils/helpers.js'

const wishlistSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer id is required.'],
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        totalProducts: {
            type: Number,
            required: [true, 'Total products required.'],
            default: 0,
        },
    },
    {
        timestamps: true,
    }
)

// Calculate total products before saving the data
wishlistSchema.pre('save', function (next) {
    this.totalProducts = this.products.length
    next()
})

// Pre-find hook to populate products and customer (remove .lean())
wishlistSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'customer', // Corrected from 'user' to 'customer'
        select: '-__v -createdAt -updatedAt -role -status -referCode',
    })

    next()
})

// Pre-save hook to validate customer and products
wishlistSchema.pre('save', async function (next) {
    try {
        // Check if customer exists
        await checkReferenceId(Customer, this.customer, next)

        // Check if products exist and validate them
        if (this.products && this.products.length > 0) {
            const productCheck = await Product.countDocuments({
                _id: { $in: this.products },
            })

            if (productCheck !== this.products.length) {
                return next(
                    new AppError('One or more products do not exist.', 400)
                )
            }
        }

        next()
    } catch (err) {
        next(err)
    }
})

const Wishlist = userDbConnection.model('Wishlist', wishlistSchema)

export default Wishlist
