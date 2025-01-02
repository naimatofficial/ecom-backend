import express from 'express'
import {
    createColor,
    getColors,
    getColorById,
    updateColor,
    deleteColor,
} from '../../controllers/admin/colorController.js'
import { validateSchema } from '../../middleware/validationMiddleware.js'
import colorValidationSchema from './../../validations/colorValidator.js'
import { protect, restrictTo } from '../../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(
        protect,

        validateSchema(colorValidationSchema),
        createColor
    )
    .get(getColors)

router
    .route('/:id')
    .get(getColorById)
    .put(protect, updateColor)
    .delete(protect, deleteColor)

export default router
