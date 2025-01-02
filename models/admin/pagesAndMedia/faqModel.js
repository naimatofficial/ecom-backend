import mongoose from 'mongoose'
import { adminDbConnection } from '../../../config/dbConnections.js'

const faqSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: [true, 'Please provide question.'],
            trim: true,
        },
        answer: {
            type: String,
            required: [true, 'Please provide answer.'],
            trim: true,
        },
        ranking: {
            type: Number,
            required: [true, 'Please provide question ranking.'],
        },
    },
    {
        timestamps: true,
    }
)

// Create the model and associate it with the AdminDB connection
const FAQ = adminDbConnection.model('FAQ', faqSchema)

export default FAQ
