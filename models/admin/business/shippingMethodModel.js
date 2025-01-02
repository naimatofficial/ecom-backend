import mongoose from 'mongoose'
import { adminDbConnection } from '../../../config/dbConnections.js'

const shippingMethodSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title  is required'],
        },
        duration: {
            type: String,
            required: [true, 'Duration is required'],
        },
        cost: {
            type: Number,
            required: [true, 'Cost is required'],
        },
    },
    { timestamps: true }
)

const ShippingMethod = adminDbConnection.model(
    'ShippingMethod',
    shippingMethodSchema
)

export default ShippingMethod
