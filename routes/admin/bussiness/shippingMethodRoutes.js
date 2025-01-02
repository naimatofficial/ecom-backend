import express from 'express'
import {
    createShippingMethod,
    deleteShippingMethodById,
    getAllShippingMethod,
    getShippingMethodById,
    updateShippingMethodById,
} from '../../../controllers/admin/business/shippingMethodController.js'

import { validateSchema } from '../../../middleware/validationMiddleware.js'
import shippingMethodValidationSchema from './../../../validations/admin/business/shippingMethodValidator.js'
import { protect, restrictTo } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(protect, createShippingMethod)

    .get(getAllShippingMethod)

router
    .route('/:id')
    .get(getShippingMethodById)
    .put(protect, updateShippingMethodById)
    .delete(protect, deleteShippingMethodById)

export default router
