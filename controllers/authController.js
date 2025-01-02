import User from '../models/admin/userModel.js'
import Customer from './../models/users/customerModel.js'
import Seller from '../models/sellers/vendorModel.js'

import { checkFields } from '../factory/handleFactory.js'
import redisClient from '../config/redisConfig.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from './../utils/appError.js'
import { loginService } from '../services/authService.js'
import {
    deleteKeysByPattern,
    removeRefreshToken,
} from '../services/redisService.js'

import {
    createPasswordResetConfirmationMessage,
    createPasswordResetMessage,
    getCacheKey,
} from '../utils/helpers.js'
import sendEmail from '../services/emailService.js'
import * as crypto from 'crypto'
import OTP from '../models/users/otpModel.js'
import * as otpService from './../services/otpService.js'
import keys from '../config/keys.js'

export const createSendToken = catchAsync(async (user, statusCode, res) => {
    // loginService is Redis database to store the token in cache
    const { accessToken } = await loginService(user)

    // set cookie options

    // Set cookie options for refresh token (secure & httpOnly)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ), // Convert days to milliseconds
        httpOnly: true, // Prevent JS access to cookie
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        // sameSite: "strict", // CSRF protection
        sameSite: 'None',
    }

    // In production mode: we set to secure = true
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

    // do not show the password to client side
    user.password = undefined
    user.verified = undefined
    user.phoneNumber = undefined

    // Store refresh token in an HTTP-only cookie
    res.cookie('jwt', accessToken, cookieOptions)

    res.status(statusCode).json({
        status: 'success',
        accessToken,
        user,
    })
})

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check the user exists && password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is Ok, then send the response to client
    createSendToken(user, 200, res)
})

export const signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = filteredData

    const newUser = await User.create({
        name,
        email,
        password,
    })

    // delete pervious cache
    const cacheKey = getCacheKey(User, '', req.query)
    await redisClient.del(cacheKey)

    createSendToken(newUser, 201, res)
})

export const logout = catchAsync(async (req, res, next) => {
    const user = req.user

    await removeRefreshToken(user._id.toString())

    // Clear the refreshToken cookie on the client
    res.clearCookie('jwt')

    res.status(200).json({
        status: 'success',
        message: 'Logout successfully',
    })
})

export const loginCustomer = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check the user exists && password is correct
    const user = await Customer.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is Ok, then send the response to client
    createSendToken(user, 200, res)
})

export const signupCustomer = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, phoneNumber, referCode } =
        req.body

    const newCustomer = new Customer({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        referCode,
    })

    await newCustomer.save()

    // 2. Generate OTP and save it in the OTP model
    const { token, hash } = otpService.generateOTP()
    await otpService.saveOTP(email, null, hash)

    // 3. Send OTP to email for verification
    await otpService.otpEmailSend(email, token)

    // 4. Clear previous cache for customers
    await deleteKeysByPattern('Customer')

    // 5. Respond with success message
    res.status(201).json({
        status: 'success',
        message: 'Please verify your account using the OTP sent to your email.',
    })
})

export const verifyCustomerOTPViaEmail = catchAsync(async (req, res, next) => {
    const { token, email } = req.body

    // Fetch the latest OTP for this email
    const otpEntry = await OTP.findOne({ email }).sort({ createdAt: -1 }).exec()

    if (!otpEntry) {
        return next(new AppError('No OTP found for this email', 404))
    }

    // Check if the OTP has expired
    // 5-minute expiration
    const isExpired = Date.now() - otpEntry.createdAt > 5 * 60 * 1000

    if (isExpired) {
        // Cleanup expired OTPs
        await OTP.deleteMany({ email })
        return next(new AppError('OTP has expired', 400))
    }

    // Validate OTP hash
    const isValid = await otpService.validateOTP(token, otpEntry.hash)

    if (!isValid) return next(new AppError('Invalid OTP provided', 400))

    // OTP is valid; proceed with deletion and user verification
    await OTP.deleteMany({ email })

    await Customer.findOneAndUpdate(
        { email },
        { verified: 'true', status: 'active' },
        { new: true }
    ).exec()

    res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully.',
    })
})

export const loginVendor = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // 1) Check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    // 2) Check the Seller exists && password is correct
    const seller = await Seller.findOne({ email }).select('+password')

    if (!seller || !(await seller.correctPassword(password, seller.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // 3) If everything is Ok, then send the response to client
    createSendToken(seller, 200, res)
})

export const sellerSignup = catchAsync(async (req, res, next) => {
    const data = checkFields(Seller, req, next)
    const newSeller = await Seller.create(data)

    // delete pervious cache
    const cacheKey = getCacheKey('Seller', '', req.query)
    await redisClient.del(cacheKey)

    createSendToken(newSeller, 201, res)
})

export const forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on posted email
    const email = req.body.email
    const user = await Customer.findOne({ email })
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
        const resetURL = `${keys.userClientURL}/auth/reset-password/${resetToken}`

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
            message:
                'Please check your email inbox for a link to complete the reset.',
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

export const resetPassword = catchAsync(async (req, res, next) => {
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
    const user = await Customer.findOne({
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

    // createSendToken(user, 200, res)
})

export const updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get the Model & find the user with including password
    const user = await Customer.findById(req.user._id).select('+password')

    // 2) Check the Posted current password is correct
    const correct = await user.correctPassword(
        req.body.passwordCurrent,
        user.password
    )

    if (!correct) {
        return next(new AppError('Your current password is incorrect.', 401))
    }

    // 3) If so, update the password
    user.password = req.body.passwordNew
    await user.save()

    // 4) send JWT
    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully.',
    })
    // createSendToken(user, 200, res)
})
