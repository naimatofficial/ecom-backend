import mongoose from 'mongoose'
import { userDbConnection } from '../../config/dbConnections.js'

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    hash: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m', // Automatically remove after 5 minutes
    },
})

const OTP = userDbConnection.model('OTP', otpSchema)

export default OTP
