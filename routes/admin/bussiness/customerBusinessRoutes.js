import express from 'express'
import {
    createCustomerBusiness,
    deleteCustomerBusinessById,
    getAllCustomerBusiness,
    getCustomerBusinessById,
    updateCustomerBusinessById,
} from '../../../controllers/admin/business/customerBusinessController.js'

import { validateSchema } from '../../../middleware/validationMiddleware.js'
import customerBusinessValidationSchema from './../../../validations/admin/business/customerBusinessValidator.js'
import { protect, restrictTo } from '../../../middleware/authMiddleware.js'
const router = express.Router()

router
    .route('/')
    .post(protect, createCustomerBusiness)

    .get(getAllCustomerBusiness)

router
    .route('/:id')
    .get(getCustomerBusinessById)
    .put(protect, updateCustomerBusinessById)
    .delete(protect, deleteCustomerBusinessById)

export default router
