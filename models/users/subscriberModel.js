import mongoose from 'mongoose'
import validator from 'validator'

import { DbConnection } from '../../config/dbConnections.js'

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Please provide your email address.'],
            unique: true,
            lowercase: true,
            validate: [
                validator.isEmail,
                'Please provide a valid email address.',
            ],
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

const Subscriber = DbConnection.model('Subscriber', subscriberSchema)

export default Subscriber
