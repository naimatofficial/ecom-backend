import OTP from '../../models/users/otpModel.js'
import * as otpService from '../../services/otpService.js'
import catchAsync from '../../utils/catchAsync.js'
import AppError from './../../utils/appError.js'

// Controller for email OTP generation
export const sendEmailOTP = catchAsync(async (req, res, next) => {
    const { email } = req.body
    const { token, hash } = otpService.generateOTP()

    await otpService.otpEmailSend(email, token)
    await otpService.saveOTP(email, null, hash)

    res.status(200).json({ message: 'OTP sent successfully to your email.' })
})

// Controller for phone OTP generation
export const sendPhoneOTP = catchAsync(async (req, res, next) => {
    const { phone } = req.body
    const { token, hash } = otpService.generateOTP()

    await otpService.sendSMS(phone, token)
    await otpService.saveOTP(null, phone, hash)

    res.status(201).json({
        message: 'OTP sent successfully to your phone.',
    })
})

export const verifyOneTimePassword = catchAsync(async (req, res, next) => {
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

    // OTP is valid, respond with success
    res.status(200).json({
        status: 'success',
        message: 'OTP verified successfully.',
    })
})
