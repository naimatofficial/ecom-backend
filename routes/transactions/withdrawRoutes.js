import express from 'express'
import {
    getAllWithdraws,
    getWithdrawById,
    deleteWithdraw,
    createWithdrawRequest,
    updateWithdrawRequestStatus,
} from '../../controllers/transactions/withdrawController.js'

import { protect } from '../../middleware/authMiddleware.js'
import { restrictTo } from '../../middleware/authMiddleware.js'
import checkObjectId from './../../middleware/checkObjectId.js'

const router = express.Router()

router
    .route('/')
    .get(protect, getAllWithdraws)
    .post(protect, createWithdrawRequest)

router
    .route('/:id', checkObjectId)
    .get(protect, getWithdrawById)
    .delete(protect, deleteWithdraw)

router.put(
    '/request-status/:id',
    checkObjectId,
    protect,
    updateWithdrawRequestStatus
)

export default router
