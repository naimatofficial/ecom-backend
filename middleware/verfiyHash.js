import generateSecureHash from '../utils/generateSecureHash.js'

export default (req, res, next) => {
    const responseHash = req.body.pp_SecureHash
    const calculatedHash = generateSecureHash(req.body, integritySalt)

    if (responseHash === calculatedHash) {
        next()
    } else {
        res.status(400).send('Invalid response hash')
    }
}
