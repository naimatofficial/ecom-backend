import express from 'express'
import {
    createCategoryWise,
    deleteCategoryWiseById,
    getAllCategoryWise,
    getCategoryWiseById,
    updateCategoryWiseById,
} from '../../../controllers/admin/business/categoryWiseController.js'

import { validateSchema } from '../../../middleware/validationMiddleware.js'
import categoryWiseValidationSchema from './../../../validations/admin/business/categoryWiseValidator.js'
import { protect, restrictTo } from '../../../middleware/authMiddleware.js'
const router = express.Router()

router
    .route('/')
    .post(protect, createCategoryWise)

    .get(getAllCategoryWise)

router
    .route('/:id')
    .get(getCategoryWiseById)
    .put(protect, updateCategoryWiseById)
    .delete(protect, deleteCategoryWiseById)

export default router
