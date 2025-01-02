import mongoose from 'mongoose'
import { adminDbConnection } from '../../../config/dbConnections.js'

const sellerSchema = new mongoose.Schema(
    {
        defaultCommission: {
            type: Number,
            default: 0,
            required: [true, 'Please provide default commission'],
        },
        enablePOSInSellerPanel: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            required: [
                true,
                'Please specify if POS in seller panel is active or inactive',
            ],
        },
        sellerRegistration: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            required: [
                true,
                'Please specify if seller registration is active or inactive',
            ],
        },
        setMinimumOrderAmount: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
            required: [
                true,
                'Please specify if setting minimum order amount is active or inactive',
            ],
        },
    },
    {
        timestamps: true,
    }
)

// Create the model using adminDbConnection
const SellerBusiness = adminDbConnection.model('SellerBusiness', sellerSchema)

export default SellerBusiness
