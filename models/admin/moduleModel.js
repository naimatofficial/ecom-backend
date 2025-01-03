import mongoose from 'mongoose'
import { DbConnection } from '../../config/dbConnections.js'

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

const Module = DbConnection.model('Module', moduleSchema)

export default Module
