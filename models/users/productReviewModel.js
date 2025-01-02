import { Schema } from 'mongoose'
import { userDbConnection } from '../../config/dbConnections.js'
import { checkReferenceId } from '../../utils/helpers.js'

import Customer from './customerModel.js'
import Product from '../sellers/productModel.js'

const productReviewSchema = new Schema(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please provide product Id.'],
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Please provide customer Id.'],
        },
        review: {
            type: String,
            required: [true, 'Please provide review.'],
            trim: true,
        },
        rating: {
            type: Number,
            required: [true, 'Please provide rating.'],
            min: [0, 'Rating cannot be negative'],
            max: [5, 'Rating cannot exceed 5'],
            set: (val) => (Math.round(val * 10) / 10).toFixed(1),
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
)

productReviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'customer',
        select: '-__v -createdAt -updatedAt -role -status -referCode',
    })
    next()
})

productReviewSchema.pre('save', async function (next) {
    await checkReferenceId(Customer, this.customer, next)
    await checkReferenceId(Product, this.product, next)

    next()
})

const ProductReview = userDbConnection.model(
    'ProductReview',
    productReviewSchema
)

export default ProductReview
