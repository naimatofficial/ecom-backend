import express from 'express'
import {
    createOrderWise,
    deleteOrderWiseById,
    getAllOrderWise,
    getOrderWiseById,
    updateOrderWiseById,
} from '../../../controllers/admin/business/orderWiseController.js'

import { validateSchema } from '../../../middleware/validationMiddleware.js'
import orderWiseValidationSchema from './../../../validations/admin/business/orderWiseValidator.js'
import { protect, restrictTo } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(protect, createOrderWise)

    .get(getAllOrderWise)

router
    .route('/:id')
    .get(getOrderWiseById)
    .put(protect, updateOrderWiseById)
    .delete(protect, deleteOrderWiseById)

export default router
