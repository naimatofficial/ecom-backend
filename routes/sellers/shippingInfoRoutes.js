import express from 'express'
import { protect, restrictTo } from '../../middleware/authMiddleware.js'

import {
    createShippingInfo,
    deleteShippingInfo,
    getAllShippingInfo,
    getShippingInfoById,
    getShippingInfoByVendorId,
    updateShippingInfo,
} from '../../controllers/sellers/shippingInfoController.js'

const router = express.Router()

router
    .route('/')
    .post(protect, createShippingInfo)
    .get(protect, getAllShippingInfo)

router.get('/vendor/:vendorId', protect, getShippingInfoByVendorId)

router
    .route('/:id')
    .get(protect, getShippingInfoById)
    .put(protect, updateShippingInfo)
    .delete(protect, deleteShippingInfo)

export default router
