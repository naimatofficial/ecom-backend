import crypto from 'crypto'
import axios from 'axios'

const jazzcashConfig = {
    merchantId: process.env.JAZZCASH_MERCHANT_ID,
    password: process.env.JAZZCASH_PASSWORD,
    hashKey: process.env.JAZZCASH_HASH_KEY,
    returnUrl: process.env.JAZZCASH_RETURN_URL,
    paymentUrl:
        'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform',
}

export const generateSecureHash = (params, hashKey) => {
    // Step 1: Sort the keys and gather their values
    const sortedKeys = Object.keys(params).sort()
    const sortedParams = sortedKeys.map((key) => params[key]).join('&')

    // Step 2: Prepend the Hash Key
    const stringToHash = `${hashKey}&${sortedParams}`

    // Step 3: Calculate HMAC-SHA256
    const hmac = crypto.createHmac('sha256', hashKey)
    hmac.update(stringToHash)
    return hmac.digest('hex').toUpperCase() // Convert to upper case if needed
}

export const initiatePayment = async (amount, orderId) => {
    const dateTime = new Date().toISOString().replace(/-|:|\.\d+/g, '')
    const params = {
        pp_Version: '2.0',
        pp_TxnType: 'MWALLET',
        pp_Language: 'EN',
        pp_MerchantID: jazzcashConfig.merchantId,
        pp_Password: jazzcashConfig.password,
        pp_TxnRefNo: orderId,
        pp_Amount: amount * 100, // Amount in paisa
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: dateTime,
        pp_BillReference: 'billRef',
        pp_Description: 'Order Payment',
        pp_ReturnURL: jazzcashConfig.returnUrl,
    }

    params.pp_SecureHash = generateSecureHash(params)

    try {
        const response = await axios.post(jazzcashConfig.paymentUrl, params)
        return response.data
    } catch (error) {
        throw new Error('Payment initiation failed')
    }
}
