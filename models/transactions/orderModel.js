import mongoose from 'mongoose'
import { transactionDbConnection } from '../../config/dbConnections.js'
import AppError from '../../utils/appError.js'
import Product from '../sellers/productModel.js'
import Vendor from '../sellers/vendorModel.js'
import { checkReferenceId } from '../../utils/helpers.js'
import Customer from '../users/customerModel.js'

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
        },
        trackingId: {
            type: String,
            default: 0,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Please provide customer.'],
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Please provide vendor.'],
        },
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: [true, 'Please provide product Id.'],
                },
                price: {
                    type: Number,
                    min: [1, 'Prdouct price cannot be less than 1.'],
                },
                discountAmount: {
                    type: Number,
                    default: 0,
                },
                shippingCost: {
                    type: Number,
                    default: 0,
                },
                taxAmount: {
                    type: Number,
                    default: 0,
                },
                quantity: {
                    type: Number,
                    required: [true, 'Please provide product quantity.'],
                    min: [1, 'Quantity cannot be less than 1.'],
                },
            },
        ],
        status: {
            type: String,
            enum: [
                'pending',
                'confirmed',
                'packaging',
                'out_for_delivery',
                'delivered',
                'failed_to_deliver',
                'returned',
                'canceled',
            ],
            default: 'pending',
        },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Unpaid'],
            default: 'Unpaid',
        },
        totalAmount: {
            type: Number,
            required: [true, 'Please provide total amount.'],
        },
        totalShippingCost: {
            type: Number,
            default: 0,
        },
        totalTaxAmount: {
            type: Number,
            default: 0,
        },
        totalQty: {
            type: Number,
            required: [true, 'Please provide total quantity.'],
        },
        totalDiscount: {
            type: Number,
            required: [true, 'Please provide total discount.'],
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'JazzCash', 'CreditCard'],
            required: true,
        },
        shippingAddress: {
            type: {
                address: String,
                city: String,
                cityId: Number,
                state: String,
                zipCode: String,
                country: String,
                phoneNumber: String,
            },
            required: [true, 'Please provide shipping address.'],
        },
        billingAddress: {
            type: {
                address: String,
                city: String,
                cityId: Number,
                state: String,
                zipCode: String,
                country: String,
                phoneNumber: String,
            },
            required: [true, 'Please provide billing address.'],
        },
        paymentRefNo: {
            type: String,
            trim: true,
        },
        orderNote: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

orderSchema.pre('save', async function (next) {
    await checkReferenceId(Customer, this.customer, next)
    await checkReferenceId(Vendor, this.vendor, next)

    // Check if products exist and validate them
    if (this.products && this.products.length > 0) {
        const productIds = this.products.map((p) => p.product)

        const productCheck = await Product.countDocuments({
            _id: { $in: productIds },
        }).lean()

        if (productCheck !== this.products.length) {
            return next(new AppError('One or more products do not exist.', 400))
        }
    }
})

const Order = transactionDbConnection.model('Order', orderSchema)

export default Order
