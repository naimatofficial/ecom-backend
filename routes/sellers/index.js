import express from 'express'

import vendorRoutes from './vendorRoutes.js'
import shippingInfoRoutes from './shippingInfoRoutes.js'
import vendorBankRoutes from './vendorBankRotues.js'
import couponRoutes from './couponRoutes.js'
import productRoutes from './productRoutes.js'
import { protect } from '../../middleware/authMiddleware.js'
import { getVendorBusinessAnalytics } from '../../controllers/analytics/bussinessAnalytics.js'

const router = express.Router()

// SELLER DB ROUTES

router.get('/business-analytics', protect, getVendorBusinessAnalytics)

router.use('/vendors', vendorRoutes)
router.use('/shippingInfo', shippingInfoRoutes)
router.use('/vendorBank', vendorBankRoutes)
router.use('/coupon', couponRoutes)
router.use('/products', productRoutes)

export default router
