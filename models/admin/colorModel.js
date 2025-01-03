import mongoose from 'mongoose'
import { DbConnection } from '../../config/dbConnections.js'

const colorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide color name.'],
            unique: true,
            trim: true,
        },
        hexCode: {
            type: String,
            required: [true, 'Please provide color hexCode.'],
            unique: true,
        },
    },
    { timestamps: true }
)

const Color = DbConnection.model('Color', colorSchema)

export default Color
