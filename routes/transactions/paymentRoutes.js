import express from 'express'
import {
    handleJazzCashResponse,
    initiateCardPayment,
    initiateWalletPayment,
    jazzCashTransactionStatus,
} from '../../controllers/transactions/jazzcashPaymentController.js'
import generateSecureHash from '../../utils/generateSecureHash.js'

const router = express.Router()

router.post('/initiate/card', initiateCardPayment)
router.post('/initiate/wallet', initiateWalletPayment)
router.post('/jazzcash/return', handleJazzCashResponse)
router.post('/jazzcash/status', jazzCashTransactionStatus)

router.post('/generate-hash', (req, res) => {
    const { salt, ...fields } = req.body

    const hash = generateSecureHash(fields, salt)

    res.json({ hash })
})

export default router
