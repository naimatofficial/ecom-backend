import express from 'express'
import {
    createSellerWallet,
    deleteSellerWalletById,
    getSellerWalletById,
    getSellerWalletByVendorId,
    getSellerWallets,
    updateSellerWalletById,
} from '../../controllers/transactions/sellerWalletController.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()

// router.get('/calculate', protect, calculateSellerWallet)

router
    .route('/')
    .post(protect, createSellerWallet)
    .get(protect, getSellerWallets)

router
    .route('/:id')
    .get(protect, getSellerWalletById)
    .put(protect, updateSellerWalletById)
    .delete(protect, deleteSellerWalletById)

router.get('/vendor/:vendorId', protect, getSellerWalletByVendorId)

export default router
