import mongoose from 'mongoose'
import Customer from './customerModel.js'

import { DbConnection } from '../../config/dbConnections.js'
import { checkReferenceId } from '../../utils/helpers.js'

const cartSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer id is required.'],
        },
        paymentMethod: {
            type: String,
            // enum: ['Credit Card', 'Debit Card', 'JazzCash', 'COD'],
        },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Unpaid', 'Refunded'],
            default: 'Unpaid',
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Vendor id is required.'],
        },
        cartItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'product id is required.'],
                },
                qty: {
                    type: Number,
                    required: true,
                    // min: [1, 'Quantity must be at least 1.'],
                },
                price: {
                    type: Number,
                    required: [true, 'Product price is required.'],
                },
                discount: {
                    type: Number,
                    default: 0,
                },
                weight: {
                    type: Number,
                    default: 0,
                },
                tax: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        totalQty: {
            type: Number,
            required: [true, 'Total quantity is required.'],
            default: 0,
        },
        subTotalAmount: {
            type: Number,
            required: [true, 'Sub total amount is required.'],
            default: 0,
        },
        totalTaxAmount: {
            type: Number,
            default: 0,
        },
        totalWeight: {
            type: Number,
            default: 0,
        },
        totalDiscountAmount: {
            type: Number,
            required: [true, 'Total discount amount is required.'],
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required.'],
            default: 0,
        },
        // totalShippingCost: {
        //     type: Number,
        //     default: 0,
        // },
    },
    {
        timestamps: true,
    }
)

// Pre-find hook to populate products and customer (remove .lean())
cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'customer', // Corrected from 'user' to 'customer'
        select: 'firstName lastName email phoneNumber image',
    })

    next()
})

// Pre-save hook to validate customer and products
cartSchema.pre('save', async function (next) {
    try {
        // Check if customer exists
        await checkReferenceId(Customer, this.customer, next)
        next()
    } catch (err) {
        next(err)
    }
})

const Cart = DbConnection.model('Cart', cartSchema)

export default Cart
