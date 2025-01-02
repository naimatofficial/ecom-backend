import express from 'express'
import {
    createCustomer,
    deleteCustomer,
    getCustomer,
    getCustomers,
    updateCustomer,
    updateCustomerStatus,
} from './../../controllers/users/customerController.js'
import {
    logout,
    loginCustomer,
    signupCustomer,
    updatePassword,
    forgotPassword,
    resetPassword,
    verifyCustomerOTPViaEmail,
} from '../../controllers/authController.js'

import { protect, restrictTo } from '../../middleware/authMiddleware.js'
import { validateSchema } from '../../middleware/validationMiddleware.js'
import customerValidationSchema from './../../validations/customerValidator.js'
import {
    forgotPasswordViaSMS,
    resetPasswordViaSMSOTP,
    validateOTPHandler,
} from '../../controllers/users/customerController.js'
// import { loginLimiter } from '../../utils/helpers.js'

const router = express.Router()

router.post('/login', loginCustomer)
router.post(
    '/register',
    validateSchema(customerValidationSchema),
    signupCustomer
)

router.post('/otp/verify', verifyCustomerOTPViaEmail)
router.post('/logout', protect, logout)

router.put('/update-password', protect, updatePassword)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:token', resetPassword)

// on sms
router.post('/forgot-password-on-sms', forgotPasswordViaSMS)
router.put('/reset-password-on-sms', resetPasswordViaSMSOTP)
router.post('/validate-otp', validateOTPHandler) // For OTP validation

router
    .route('/')
    .post(protect, validateSchema(customerValidationSchema), createCustomer)
    .get(protect, getCustomers)

router.put('/status/:id', protect, updateCustomerStatus)

router
    .route('/:id')
    .get(getCustomer)
    .put(protect, updateCustomer)
    .delete(protect, restrictTo('user-management'), deleteCustomer)

export default router
