import express from 'express'
import {
    createSubCategory,
    getAllSubCategories,
    getSubCategoryById,
    getSubCategoryBySlug,
    updateSubCategoryById,
    deleteSubCategoryById,
} from './../../../controllers/admin/categories/subCategoryController.js'
import { validateSchema } from '../../../middleware/validationMiddleware.js'
import subCategoryValidationSchema from './../../../validations/admin/categories/subCateogoryValidator.js'
import { protect, restrictTo } from './../../../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(
        protect,

        validateSchema(subCategoryValidationSchema),
        createSubCategory
    )
    .get(getAllSubCategories)

router
    .route('/:id')
    .get(getSubCategoryById)
    .put(protect, updateSubCategoryById)
    .delete(protect, deleteSubCategoryById)

router.route('/slug/:slug').get(getSubCategoryBySlug)

export default router
