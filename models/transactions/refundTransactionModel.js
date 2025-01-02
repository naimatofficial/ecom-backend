import mongoose from 'mongoose'
import { adminDbConnection } from './../../config/dbConnections.js'

const refundTransactionSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        refundId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        shopName: {
            type: String,
            required: true,
            trim: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: [
                'CashOnDelivery',
                'JazzCash',
                'CreditCard',
                'Wallet',
                'Offline',
            ],
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        },
        paidBy: {
            type: String, // e.g., "Admin", "Shop", "System"
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            min: 0,
        },
        transactionType: {
            type: String,
            required: true,
            enum: ['Refund', 'Partial Refund'],
            trim: true,
        },
    },
    { timestamps: true }
)

RefundTransaction = adminDbConnection.model(
    'RefundTransaction',
    refundTransactionSchema
)

export default RefundTransaction
