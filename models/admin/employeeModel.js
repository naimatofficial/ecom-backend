import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

import { adminDbConnection } from '../../config/dbConnections.js'

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please tell us your name.'],
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
        },
        password: {
            type: String,
            required: [true, 'Please provide a password.'],
            minlength: 8,
            select: false,
        },
        identifyType: {
            type: String,
            enum: ['nid', 'passport'],
        },
        identifyNumber: {
            type: Number,
        },
        identityImage: {
            type: String,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'inactive',
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: true,
    }
)

employeeSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'role',
        select: '-__v',
    })
    next()
})

employeeSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

employeeSchema.pre('save', async function (next) {
    // Only work when the password is not modified
    if (!this.isModified('password')) return next()

    // Hash the password using cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    next()
})

employeeSchema.methods.changePasswordAfter = function (JWTTimestamp) {
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

employeeSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return resetToken
}

const Employee = adminDbConnection.model('employee', employeeSchema)

export default Employee
