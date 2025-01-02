import express from 'express'

import {
    createBrand,
    getBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    updateBrandStatus,
    getBrandBySlug,
} from './../../controllers/admin/brandController.js'
import { protect, restrictTo } from './../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createBrand).get(getBrands)

router
    .route('/:id')
    .get(getBrandById)
    .put(protect, updateBrand)
    .delete(protect, deleteBrand)

router.route('/status/:id').put(protect, updateBrandStatus)

router.get('/slug/:slug', getBrandBySlug)

export default router
