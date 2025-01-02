import { Router } from 'express'
import * as otpController from '../../controllers/users/otpController.js'

const router = Router()

router.post('/send-email', otpController.sendEmailOTP)

router.post('/send-phone', otpController.sendPhoneOTP)

router.post('/verify', otpController.verifyOneTimePassword)

export default router
