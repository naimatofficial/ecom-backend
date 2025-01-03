import mongoose from 'mongoose'
import { DbConnection } from '../../../config/dbConnections.js'

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

const ShippingMethod = DbConnection.model(
    'ShippingMethod',
    shippingMethodSchema
)

export default ShippingMethod
