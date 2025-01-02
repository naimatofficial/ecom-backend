import mongoose from 'mongoose'
import * as crypto from 'crypto'
import validator from 'validator'
import bcrypt from 'bcryptjs'

import { userDbConnection } from '../../config/dbConnections.js'

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    cityId: {
        type: Number,
    },
    zipCode: {
        type: Number,
    },

    state: {
        type: String,
    },
    address: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
})

const customerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Please tell us your name.'],
            trim: true,
        },
        lastName: {
            type: String,
            trim: true,
        },
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
        phoneNumber: {
            type: String,
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: ['customer'],
            default: 'customer',
        },
        referCode: {
            type: String,
        },
        password: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            select: false,
        },
        verified: {
            type: String,
            enum: ['false', 'true'],
            default: 'false',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
        },
        permanentAddress: addressSchema,
        shippingAddress: addressSchema,
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true,
    }
)

customerSchema.methods.correctPassword = async function (
    candidatePassword,
    customerPassword
) {
    return await bcrypt.compare(candidatePassword, customerPassword)
}

customerSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )

        return JWTTimestamp < changeTimestamp
    }
    // NO password changed
    return false
}

customerSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

customerSchema.pre('save', async function (next) {
    // Only work when the password is not modified
    if (!this.isModified('password')) return next()

    // Hash the password using cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    next()
})

customerSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()

    // 1 sec minus: beaucese the unexcepted bug during issued jwt token
    // the token created after the password changed
    this.passwordChangedAt = Date.now() - 1000

    next()
})

const Customer = userDbConnection.model('Customer', customerSchema)

export default Customer
