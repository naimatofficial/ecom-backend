import express from 'express'
import {
    createRefund,
    getAllRefunds,
    getRefundById,
    updateRefundStatus,
    deleteRefund,
} from '../../controllers/transactions/refundController.js'
import { validateSchema } from '../../middleware/validationMiddleware.js'
import refundValidationSchema from '../../validations/admin/transactions/refundValidator.js'
import { protect } from '../../middleware/authMiddleware.js'
import { restrictTo } from '../../middleware/authMiddleware.js'
const router = express.Router()

router
    .route('/')
    .get(protect, getAllRefunds)
    .post(protect, validateSchema(refundValidationSchema), createRefund)

router.route('/:id').get(protect, getRefundById).delete(protect, deleteRefund)

router.put(
    '/status/:id',
    protect,

    updateRefundStatus
)

export default router
