import express from 'express'
import {
    createAttribute,
    getAttributes,
    getAttributeById,
    updateAttribute,
    deleteAttribute,
} from '../../controllers/admin/attributeController.js'
import { validateSchema } from '../../middleware/validationMiddleware.js'
import attributeValidationSchema from './../../validations/attributeValidator.js'
import { protect, restrictTo } from '../../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(
        protect,

        validateSchema(attributeValidationSchema),
        createAttribute
    )
    .get(getAttributes)
router
    .route('/:id')
    .get(getAttributeById)
    .put(protect, updateAttribute)
    .delete(protect, deleteAttribute)

export default router
