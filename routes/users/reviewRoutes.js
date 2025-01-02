import express from 'express'

import { protect, restrictTo } from './../../middleware/authMiddleware.js'

import {
    createProductReview,
    deleteProductReview,
    getAllProductReviews,
    getProductReviewById,
    updateProductReview,
    updateProductReviewStatus,
} from '../../controllers/users/reviewController.js'

import { validateSchema } from '../../middleware/validationMiddleware.js'
import reviewValidationSchema from './../../validations/reviewValidator.js'

const router = express.Router()

router
    .route('/')
    .post(protect, validateSchema(reviewValidationSchema), createProductReview)
    .get(protect, getAllProductReviews)

router
    .route('/:id')
    .get(protect, getProductReviewById)
    .put(protect, updateProductReview)
    .delete(protect, deleteProductReview)

router.put('/status/:id', protect, updateProductReviewStatus)

export default router
