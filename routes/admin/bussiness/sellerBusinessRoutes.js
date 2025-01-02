import express from 'express'
import {
    createSellerBusiness,
    deleteSellerBusinessById,
    getAllSellerBusiness,
    getSellerBusinessById,
    updateSellerBusinessById,
} from '../../../controllers/admin/business/sellerBusinessController.js'

import { validateSchema } from '../../../middleware/validationMiddleware.js'
import sellerBusinessValidationSchema from './../../../validations/admin/business/sellerBusinessValidator.js'
import { protect, restrictTo } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createSellerBusiness).get(getAllSellerBusiness)

router
    .route('/:id')
    .get(getSellerBusinessById)
    .put(protect, updateSellerBusinessById)
    .delete(protect, deleteSellerBusinessById)

export default router
