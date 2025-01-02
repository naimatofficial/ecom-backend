import mongoose from 'mongoose'
import { adminDbConnection } from '../../config/dbConnections.js'

const moduleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

const Module = adminDbConnection.model('Module', moduleSchema)

export default Module
