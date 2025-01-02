import mongoose from 'mongoose'
import AppError from '../../../utils/appError.js'
import { adminDbConnection } from '../../../config/dbConnections.js'
import Product from '../../sellers/productModel.js'

const flashDealSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Please provide title.'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Please provide image.'],
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
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
            enum: ['active', 'expired', 'inactive'],
            default: 'inactive',
        },
        publish: {
            type: Boolean,
            default: false,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
)

// Add a virtual field to calculate the total number of products
flashDealSchema.virtual('activeProducts').get(function () {
    return this.products.length
})

flashDealSchema.pre('save', function (next) {
    // Check if endDate is less than startDate
    if (this.endDate && this.startDate && this.endDate < this.startDate) {
        this.status = 'expired'
    }
    next()
})

flashDealSchema.pre('save', async function (next) {
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

const FlashDeal = adminDbConnection.model('FlashDeal', flashDealSchema)

export default FlashDeal
