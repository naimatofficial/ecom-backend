import crypto from 'crypto'

const generateSecureHash = (params, integritySalt) => {
    const sortedParams = Object.keys(params)
        .filter((key) => params[key])
        .sort()
        .map((key) => params[key])
        .join('&')

    const stringToHash = `${integritySalt}&${sortedParams}`

    const secureHash = crypto
        .createHmac('sha256', integritySalt)
        .update(stringToHash)
        .digest('hex')
        .toUpperCase()

    return secureHash
}

export default generateSecureHash
