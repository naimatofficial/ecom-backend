import mongoose from 'mongoose'
import { transactionDbConnection } from '../../config/dbConnections.js'

const sellerWalletSchema = new mongoose.Schema(
    {
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: [true, 'Please provide vendor id.'],
            unique: true,
        },
        withdrawableBalance: {
            type: Number,
            default: 0,
        },
        pendingWithdraw: {
            type: Number,
            default: 0,
        },
        alreadyWithdrawn: {
            type: Number,
            default: 0,
        },
        totalTaxGiven: {
            type: Number,
            default: 0,
        },
        totalCommissionGiven: {
            type: Number,
            default: 0,
        },
        totalDeliveryChargeGiven: {
            type: Number,
            default: 0,
        },
        collectedCash: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
)

const SellerWallet = transactionDbConnection.model(
    'SellerWallet',
    sellerWalletSchema
)

export default SellerWallet
