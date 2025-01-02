import mongoose from 'mongoose'
import { transactionDbConnection } from '../../config/dbConnections.js'

const withdrawSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
            required: true,
        },
        note: {
            type: String,
            maxlength: 500,
            default: '',
        },
        accountName: {
            type: String,
            required: [true, 'Please provide account name.'],
            trim: true,
        },
        accountNumber: {
            type: String,
            required: true,
        },
        accountProvider: {
            type: String,
            required: true,
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            default: null,
        },
        processedAt: {
            type: Date,
            default: null,
        },
        transactionReceiptImage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

const Withdraw = transactionDbConnection.model('Withdraw', withdrawSchema)

export default Withdraw
