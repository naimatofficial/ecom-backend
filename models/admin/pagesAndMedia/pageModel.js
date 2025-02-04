import mongoose from 'mongoose'
import { DbConnection } from '../../../config/dbConnections.js'

const pageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide Page name.'],
            unique: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide Page description.'],
        },
        slug: {
            type: String,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
)

// Create the model and associate it with the AdminDB connection
const Page = DbConnection.model('Page', pageSchema)

export default Page
