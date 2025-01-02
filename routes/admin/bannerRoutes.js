import express from 'express'
import {
    createBanner,
    getBanners,
    updateBanner,
    deleteBanner,
    getBannerById,
    updateBannerPublishStatus,
} from '../../controllers/admin/bannerController.js'
import checkObjectId from '../../middleware/checkObjectId.js'
import { protect, restrictTo } from './../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createBanner).get(getBanners)

router
    .route('/:id', checkObjectId)
    .get(getBannerById)
    .put(protect, updateBanner)
    .delete(protect, deleteBanner)

router.put('/publish/:id', protect, updateBannerPublishStatus)

export default router
