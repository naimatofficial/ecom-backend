import mongoose from 'mongoose'
import { adminDbConnection } from '../../../config/dbConnections.js'

const dealOfTheDaySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please provide product'],
        },
        title: {
            type: String,
            required: [true, 'Please provide title'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'inactive'],
            default: 'inactive',
        },
    },
    {
        timestamps: true,
    }
)
const DealOfTheDay = adminDbConnection.model('DealOfTheDay', dealOfTheDaySchema)

export default DealOfTheDay
