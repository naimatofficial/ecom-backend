import express from 'express'
import {
    createTransaction,
    deleteTransaction,
    getTransactionById,
    getTransactions,
    updateTransaction,
} from '../../controllers/transactions/transactionController.js'
import { protect, restrictTo } from '../../middleware/authMiddleware.js'
import checkObjectId from '../../middleware/checkObjectId.js'

const router = express.Router()

router.route('/').post(createTransaction).get(protect, getTransactions)

router
    .route('/:id', checkObjectId)
    .get(protect, getTransactionById)
    .put(protect, updateTransaction)
    .delete(protect, deleteTransaction)

export default router
