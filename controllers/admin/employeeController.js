import * as crypto from 'crypto'

import Employee from '../../models/admin/employeeModel.js'
import AppError from '../../utils/appError.js'
import catchAsync from '../../utils/catchAsync.js'
import { createSendToken } from '../authController.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
    updateStatus,
} from './../../factory/handleFactory.js'
import {
    deleteKeysByPattern,
    removeRefreshToken,
} from '../../services/redisService.js'
import {
    createPasswordResetConfirmationMessage,
    createPasswordResetMessage,
} from '../../utils/helpers.js'
import sendEmail from '../../services/emailService.js'

import OTP from '../../models/users/otpModel.js'
import * as otpService from './../../services/otpService.js'
import keys from '../../config/keys.js'

export const employeeLogin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check the user exists && password is correct
    const user = await Employee.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is Ok, then send the response to client
    createSendToken(user, 200, res)
})

export const createEmployee = createOne(Employee)
export const getEmployees = getAll(Employee)
export const getEmployeeById = getOne(Employee)
export const deleteEmployee = deleteOne(Employee)
export const updateEmployee = updateOne(Employee)
export const updateEmployeeStatus = updateStatus(Employee)

export const updateEmployeePassword = catchAsync(async (req, res, next) => {
    const user = await Employee.findById(req.user._id).select('+password')

    // 2) Check the Posted current password is correct
    const correct = await user.correctPassword(
        req.body.passwordCurrent,
        user.password
    )

    if (!correct) {
        return next(new AppError('Your current password is wrong.', 401))
    }

    // 3) If so, update the password
    user.password = req.body.passwordNew
    user.passwordChangedAt = Date.now()

    await user.save()

    await deleteKeysByPattern('Employee')

    // 4) send JWT
    createSendToken(user, 200, res)
})

export const forgotEmployeePassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on posted email
    const email = req.body.email
    const user = await Employee.findOne({ email })
    if (!user) {
        return next(
            new AppError('There is no user with that email address.', 404)
        )
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })

    // 3) Send it to user's email
    try {
        const resetURL = `${keys.adminClientURL}/auth/reset-password/${resetToken}`

        // Get the user's IP address
        const ipAddress =
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress

        const timestamp =
            new Date().toISOString().replace('T', ' ').substring(0, 16) + ' GMT'

        const message = createPasswordResetMessage(
            user.email,
            ipAddress,
            timestamp,
            resetURL
        )

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)!',
            html: message,
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        })
    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })

        return next(
            new AppError(
                'There was an error sending the email. Try again later!',
                500
            )
        )
    }
})

export const resetEmployeePassword = catchAsync(async (req, res, next) => {
    // 1) Create a hashedToken
    const { passwordNew, passwordConfirm } = req.body

    if (passwordNew !== passwordConfirm) {
        return next(new AppError('Passwords not matched!', 400))
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    // 2) Check the user exists and also check password reset expires is greater then current time
    const user = await Employee.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400))
    }

    // 3) Set email message
    const ipAddress = req.ip // Get the user's IP address
    const timestamp =
        new Date().toISOString().replace('T', ' ').substring(0, 16) + ' GMT'

    const message = createPasswordResetConfirmationMessage(
        user.email,
        ipAddress,
        timestamp
    )

    // 3) Update the user properties & remove the unnecessary fields
    user.password = passwordNew
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    user.passwordChangedAt = Date.now()

    await user.save()

    await sendEmail({
        email: user.email,
        subject: 'Password Reset Confirmation',
        html: message,
    })

    await removeRefreshToken(user._id.toString())

    // Clear the refreshToken cookie on the client
    res.clearCookie('jwt')

    res.status(200).json({
        status: 'success',
        message: 'Password reset successfully.',
    })
})

///// reset password via sms

export const forgotPasswordViaSMS = catchAsync(async (req, res, next) => {
    const { phone } = req.body

    const vendor = await Employee.findOne({ phoneNumber: phone })
    if (!vendor) {
        return next(
            new AppError('Vendor with this phone number not found', 404)
        )
    }

    // Generate and save OTP
    const { token, hash } = otpService.generateOTP()
    await otpService.saveOTP(null, phone, hash)

    // Send OTP via SMS
    await otpService.otpSMSSend(phone, token)

    res.status(200).json({
        status: 'success',
        message: 'OTP sent to your registered phone number.',
    })
})

export const resetPasswordViaSMSOTP = catchAsync(async (req, res, next) => {
    const { phone, otp, passwordNew, passwordConfirm } = req.body
    if (passwordNew !== passwordConfirm) {
        return next(new AppError('Passwords do not match!', 400))
    }
    const otpEntry = await OTP.findOne({ phone })

    if (!otpEntry) {
        return next(new AppError('Invalid or expired OTP', 400))
    }
    const isValidOTP = await otpService.validateOTP(otp, otpEntry.hash)
    if (!isValidOTP) {
        return next(new AppError('Invalid or expired OTP', 400))
    }

    // 3) Find the vendor
    const vendor = await Employee.findOne({ phoneNumber: phone })
    if (!vendor) {
        return next(
            new AppError('Vendor with this phone number not found', 404)
        )
    }

    // 4) Update the vendor's password
    vendor.password = passwordNew
    vendor.passwordChangedAt = Date.now()
    await vendor.save()
    res.status(200).json({
        status: 'success',
        message: 'Password reset successfully.',
    })
})

export const validateOTPHandler = catchAsync(async (req, res, next) => {
    const { phone, otp } = req.body

    // Retrieve the OTP entry for the user
    const otpEntry = await OTP.findOne({ phone })

    if (!otpEntry) {
        return next(new AppError('OTP not found or expired!', 400))
    }

    // Validate OTP
    const isValidOTP = await otpService.validateOTP(otp, otpEntry.hash)
    console.log('is valid otp ', isValidOTP)
    if (!isValidOTP) {
        return next(new AppError('Invalid or expired OTP', 400))
    }

    // If OTP is valid, proceed with sending the success response and show password fields
    res.status(200).json({
        status: 'success',
        message: 'OTP validated successfully. You can now reset your password.',
    })
})
