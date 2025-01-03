import mongoose from 'mongoose'
import { DbConnection } from '../../config/dbConnections.js'

const transactionSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: [true, 'Order id is required'],
            unique: true,
        },
        shopName: {
            type: String,
            required: [true, "'Shop Name' is required"],
            trim: true,
        },
        customerName: {
            type: String,
            required: [true, "'Customer Name' is required"],
            trim: true,
        },
        paymentRefNo: {
            type: String,
            trim: true,
        },
        // totalProductAmount: {
        //     type: Number,
        //     required: [true, "'Total Product Amount' is required"],
        //     default: 0,
        // },
        // productDiscount: {
        //     type: Number,
        //     default: 0,
        // },
        couponDiscount: {
            type: Number,
            default: 0,
        },
        discountedAmount: {
            type: Number,
            default: 0,
        },
        vatOrTax: {
            type: Number,
            default: 0,
        },
        shippingCharge: {
            type: Number,
            default: 0,
        },
        orderAmount: {
            type: Number,
            required: [true, "'Order Amount' is required"],
            default: 0,
        },
        deliveredBy: {
            type: String,
            trim: true,
        },
        deliverymanIncentive: {
            type: Number,
            default: 0,
        },
        paymentMethod: {
            type: String,
            trim: true,
            required: [true, "'Payment Method' is required"],
            enum: {
                values: [
                    'COD',
                    'Digital',
                    'Wallet',
                    'Offline',
                    'CreditCard',
                    'JazzCash',
                ],
                message:
                    "'Payment Method' must be either 'COD', 'JazzCash', 'Digital', 'Wallet', 'Offline',  or 'CeditCard'",
            },
        },
        paymentStatus: {
            type: String,
            trim: true,
            required: [true, "'Payment Status' is required"],
            enum: {
                values: ['Completed', 'Pending', 'Failed'],
                message:
                    "'Payment Status' must be either 'Completed', 'Pending', or 'Failed'",
            },
        },
    },
    {
        timestamps: true,
    }
)

const Transaction = DbConnection.model('Transaction', transactionSchema)
export default Transaction
