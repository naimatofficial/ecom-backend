import axios from 'axios'
import generateSecureHash from './../../utils/generateSecureHash.js'
import keys from './../../config/keys.js'
import moment from 'moment-timezone'
import catchAsync from '../../utils/catchAsync.js'
import AppError from '../../utils/appError.js'

// Card Transaction: Page Redirection
export const initiateCardPayment = catchAsync(async (req, res, next) => {
    const { amount } = req.body

    const description = 'Online Purchasing from Vista Mart store.'
    // Unique transaction reference
    const txnRefNo =
        'T' +
        moment().tz('Asia/Karachi').format('YYYYMMDDHHmmss') +
        Math.floor(Math.random() * 1000)

    // Set transaction date-time to Pakistan time (GMT+5)
    const txnDateTime = moment().tz('Asia/Karachi').format('YYYYMMDDHHmmss')

    // Set expiration time to 3 dasy (72 hours) from now in Pakistan time (GMT+5)
    const txnExpiryDateTime = moment()
        .tz('Asia/Karachi')
        .add(72, 'hours')
        .format('YYYYMMDDHHmmss')

    const billRef = 'billRef' + Math.floor(Math.random() * 10000000)

    const params = {
        pp_Version: '1.1',
        pp_BillReference: billRef,
        pp_Amount: amount * 100,
        pp_Description: description,
        pp_Language: 'EN',
        pp_MerchantID: keys.jazzCashMerchantId,
        pp_Password: keys.jazzCashPassword,
        pp_TxnRefNo: txnRefNo,
        pp_TxnType: 'MPAY',
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: txnDateTime,
        pp_TxnExpiryDateTime: txnExpiryDateTime,
        pp_ReturnURL: keys.jazzCashReturnUrl,
        pp_BankId: '',
        pp_ProductId: '',
        ppmpf_1: '',
        ppmpf_2: '',
        ppmpf_3: '',
        ppmpf_4: '',
        ppmpf_5: '',
    }

    params.pp_SecureHash = generateSecureHash(
        params,
        keys.jazzCashIntegritySalt
    )

    if (!params.pp_SecureHash) {
        return next(new AppError('Secure Hash is not defined!', 400))
    }

    res.status(200).json({ params })
})

// Wallet Transaction using API v2.0
export const initiateWalletPayment = catchAsync(async (req, res, next) => {
    // JazzCash credentials (replace with your actual credentials)
    const { amount, cnic, phone, description } = req.body

    const txnRefNo =
        'T' +
        moment().tz('Asia/Karachi').format('YYYYMMDDHHmmss') +
        Math.floor(Math.random() * 1000)
    const txnDateTime = moment().tz('Asia/Karachi').format('YYYYMMDDHHmmss')
    const txnExpiryDateTime = moment()
        .tz('Asia/Karachi')
        .add(24, 'hours')
        .format('YYYYMMDDHHmmss')

    // const orderId = parseInt(uuid.replace(/-/g, '').slice(0, 4), 16)
    const billRef = 'billRef' + Math.floor(Math.random() * 10000000)

    // Concatenate parameters for HMAC calculation in alphabetical order
    const params = {
        pp_Amount: Math.round(amount * 100),
        pp_MerchantID: keys.jazzCashMerchantId,
        pp_SubMerchantID: '',
        pp_Password: keys.jazzCashPassword,
        pp_TxnRefNo: txnRefNo,
        pp_BillReference: billRef,
        pp_CNIC: cnic,
        pp_Description: description,
        pp_Language: 'EN',
        pp_MobileNumber: phone,

        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: txnDateTime,
        pp_TxnExpiryDateTime: txnExpiryDateTime,
        ppmpf_1: '',
        ppmpf_2: '',
        ppmpf_3: '',
        ppmpf_4: '',
        ppmpf_5: '',
    }

    params.pp_SecureHash = generateSecureHash(
        params,
        keys.jazzCashIntegritySalt
    )

    if (!params.pp_SecureHash) {
        return next(new AppError('Secure Hash is not defined!', 400))
    }

    const response = await axios.post(keys.jazzCashMobileWalletPostUrl, params)

    if (
        response.data.pp_ResponseMessage ===
        'Please provide a valid value for pp_ CNIC.'
    ) {
        return next(new AppError('Please proivde valid CNIC.', 400))
    } else if (
        response.data.pp_ResponseMessage ===
        'Please provide a valid value for pp_ phone Number.'
    ) {
        return next(new AppError('Please proivde valid Phone Number.', 400))
    } else if (
        response.data.pp_ResponseMessage ===
        'Please provide a valid value for pp_ Description.'
    ) {
        return next(new AppError('Please proivde valid Description.', 400))
    } else if (
        response.data.pp_ResponseMessage ===
        'Thank you for Using JazzCash, your transaction was successful.'
    ) {
        return res.status(201).json({
            status: 'success',
            message: response.data.pp_ResponseMessage,
        })
    } else
        return next(
            new AppError(
                'Transaction failed. Verify your details and try again.',
                400
            )
        )
})

// Handle JazzCash Response for Card Transactions
export const handleJazzCashResponse = (req, res) => {
    try {
        const {
            pp_ResponseCode,
            pp_SecureHash,
            pp_ResponseMessage,
            pp_Amount,
            pp_TxnRefNo,
        } = req.body

        const clientUrl = keys.userClientURL
        // const clientUrl = 'http://localhost:80'

        // if (pp_ResponseCode === '000') {
        //     res.redirect(
        //         `${clientUrl}/checkout/card?paymentStatus=Successful&amount=${pp_Amount}`
        //     )
        // }

        if (pp_ResponseCode === '000') {
            return res.redirect(
                `${clientUrl}/checkout/card?paymentStatus=Successful&amount=${encodeURIComponent(
                    pp_Amount
                )}&ref=${pp_TxnRefNo}`
            )
        }

        return res.redirect(`${clientUrl}/checkout/card?paymentStatus=Fail`)
    } catch (error) {
        return res.redirect(`${clientUrl}/checkout/card?paymentStatus=Error`)
    }
}

export const jazzCashTransactionStatus = catchAsync(async (req, res, next) => {
    const { txnRefNo } = req.body

    const params = {
        pp_TxnRefNo: txnRefNo,
        pp_MerchantID: keys.jazzCashMerchantId,
        pp_Password: keys.jazzCashPassword,
    }

    params.pp_SecureHash = generateSecureHash(
        params,
        keys.jazzCashIntegritySalt
    )

    if (!params.pp_SecureHash) {
        return next(new AppError('Secure Hash is not defined!', 400))
    }

    const { data } = await axios.post(keys.jazzCashPaymentInquireUrl, params)

    res.status(200).json({
        status: 'success',
        message: 'Payment inquiry status',
        doc: data,
    })
})
