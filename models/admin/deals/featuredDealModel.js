import mongoose from 'mongoose'
import AppError from '../../../utils/appError.js'
import { adminDbConnection } from '../../../config/dbConnections.js'
import Product from '../../sellers/productModel.js'

const featuredDealSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide title.'],
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, 'Please provide start date.'],
        },
        endDate: {
            type: Date,
            required: [true, 'Please provide end date.'],
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'expired'],
            default: 'inactive',
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                // ref: 'Product',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
)

featuredDealSchema.pre('save', async function (next) {
    try {
        // Check if products are provided and validate them
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

// Add a virtual field to calculate the total number of products
featuredDealSchema.virtual('activeProducts').get(function () {
    return this.products.length
})

const FeaturedDeal = adminDbConnection.model('FeaturedDeal', featuredDealSchema)

export default FeaturedDeal
