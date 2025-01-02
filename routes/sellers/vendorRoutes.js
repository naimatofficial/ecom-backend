import express from 'express'
import {
    createVendor,
    registerVendor,
    updateVendorStatus,
    getAllVendors,
    getVendorById,
    deleteVendor,
    updateVendor,
    getVendorBySlug,
    updateVendorPassword,
    updateShopStatus,
    forgotVendorPassword,
    resetVendorPassword,
    verifyVendorOTPViaEmail,
    forgotPasswordViaSMS,
    resetVendorPasswordViaOTP,
    validateOTPHandler,
    searchVendors,
} from '../../controllers/sellers/vendorController.js'
import { validateSchema } from '../../middleware/validationMiddleware.js'
import vendorValidationSchema from '../../validations/admin/sellers/vendorValidator.js'

import { protect, restrictTo } from '../../middleware/authMiddleware.js'
import { loginVendor, logout } from '../../controllers/authController.js'

const router = express.Router()

router
    .route('/signup')
    .post(validateSchema(vendorValidationSchema), registerVendor)

router.post('/otp/verify', verifyVendorOTPViaEmail)

router.post('/login', loginVendor)
router.post('/logout', protect, logout)

router.put('/update-password', protect, updateVendorPassword)
router.post('/forgot-password', forgotVendorPassword)
router.put('/reset-password/:token', resetVendorPassword)

router.post('/forgot-password-on-sms', forgotPasswordViaSMS)
router.put('/reset-password-on-sms', resetVendorPasswordViaOTP)
router.post('/validate-otp', validateOTPHandler) // For OTP validation

router.route('/').post(protect, createVendor).get(getAllVendors)

router.get('/search', searchVendors)

router
    .route('/:id')
    .get(getVendorById)
    .delete(protect, deleteVendor)
    .put(protect, updateVendor)

router.put('/status/:id', protect, updateVendorStatus)

router.put('/shop-status/:id', protect, updateShopStatus)

router.get('/slug/:slug', getVendorBySlug)

export default router
