import express from 'express'
import {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    updateCouponStatus,
    deleteCoupon,
} from '../../controllers/sellers/couponController.js'
import { protect, restrictTo } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createCoupon).get(protect, getAllCoupons)

router
    .route('/:id')
    .get(getCouponById)
    .put(protect, updateCoupon)
    .delete(protect, deleteCoupon)

router.put('/status/:id', protect, updateCouponStatus)

export default router
