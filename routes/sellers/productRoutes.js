import express from 'express'
import {
    createProduct,
    getAllProducts,
    getProductById,
    deleteProduct,
    updateProductStatus,
    updateProductFeaturedStatus,
    updateProduct,
    getProductBySlug,
    bulkImportProducts,
} from '../../controllers/sellers/productController.js'
import { protect, restrictTo } from '../../middleware/authMiddleware.js'
import { validateSchema } from '../../middleware/validationMiddleware.js'
import productValidationSchema from '../../validations/admin/sellers/productValidator.js'

const router = express.Router()

router.route('/').post(protect, createProduct).get(getAllProducts)

router.post('/bulk-import', protect, bulkImportProducts)

router
    .route('/:id')
    .get(getProductById)
    .put(protect, updateProduct)
    .delete(protect, deleteProduct)

router.put('/status/:id', protect, updateProductStatus)

router.get('/slug/:slug', getProductBySlug)

router.route('/:id/feature').put(protect, updateProductFeaturedStatus)

export default router
