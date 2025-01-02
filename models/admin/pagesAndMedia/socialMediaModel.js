import mongoose from 'mongoose'
import { adminDbConnection } from '../../../config/dbConnections.js'

const socialMediaSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide SocialMedia name.'],
            unique: true,
            trim: true,
        },
        link: {
            type: String,
            required: [true, 'Please provide SocialMedia description.'],
        },
        status: {
            type: String,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

const SocialMedia = adminDbConnection.model('SocialMedia', socialMediaSchema)

export default SocialMedia
