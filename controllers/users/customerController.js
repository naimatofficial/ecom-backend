import Customer from '../../models/users/customerModel.js'
import catchAsync from '../../utils/catchAsync.js'
import {
    createOne,
    getAll,
    getOne,
    updateStatus,
} from '../../factory/handleFactory.js'
import { deleteKeysByPattern } from '../../services/redisService.js'

import OTP from '../../models/users/otpModel.js'
import * as otpService from './../../services/otpService.js'

export const createCustomer = createOne(Customer)
export const getCustomers = getAll(Customer)
export const getCustomer = getOne(Customer)

export const deleteCustomer = catchAsync(async (req, res, next) => {
    const customer = await Customer.findByIdAndDelete(req.params.id).exec()

    // Handle case where the customer was not found
    if (!customer) {
        return next(new AppError(`No customer found with that ID`, 404))
    }

    // Delete all products associated with this customer
    // await ProductReview.deleteMany({ customer: req.params.id }).exec()

    await deleteKeysByPattern('Customer')

    res.status(204).json({
        status: 'success',
        doc: null,
    })
})

export const updateCustomer = catchAsync(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phoneNumber,
        image,
        status,
        permanentAddress,
        shippingAddress,
    } = req.body

    const data = {
        firstName,
        lastName,
        email,
        phoneNumber,
        status,
        image,
        permanentAddress,
        shippingAddress,
    }

    // Perform the update operation
    const customer = await Customer.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
    })

    // Handle case where the document was not found
    if (!customer) {
        return next(new AppError(`No customer found with that ID`, 404))
    }

    await deleteKeysByPattern('Customer')

    res.status(200).json({
        status: 'success',
        doc: customer,
    })
})

export const updateCustomerStatus = updateStatus(Customer)

///// reset password via sms
export const forgotPasswordViaSMS = catchAsync(async (req, res, next) => {
    const { phone } = req.body

    const vendor = await Customer.findOne({ phoneNumber: phone })
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
    const vendor = await Customer.findOne({ phoneNumber: phone })
    if (!vendor) {
        return next(
            new AppError('Employee with this phone number not found', 404)
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

    if (!isValidOTP) {
        return next(new AppError('Invalid or expired OTP', 400))
    }

    res.status(200).json({
        status: 'success',
        message: 'OTP validated successfully. You can now reset your password.',
    })
})
