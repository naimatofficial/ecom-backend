import express from 'express'
import {
    calculateAdminWallet,
    deleteAdminWalletById,
    getAdminWalletById,
    getAdminWallets,
    updateAdminWalletById,
} from '../../controllers/transactions/adminWalletController.js'
import { protect } from '../../middleware/authMiddleware.js'
import { restrictTo } from '../../middleware/authMiddleware.js'
const router = express.Router()

// Route to calculate and retrieve admin wallet data
router.get('/calculate', protect, calculateAdminWallet)

router.route('/').get(protect, getAdminWallets)

router
    .route('/:id')
    .get(protect, getAdminWalletById)
    .put(protect, updateAdminWalletById)
    .delete(protect, deleteAdminWalletById)

//Route Of Top Customer/Product/Selling Store
// router.get('/top', protect, getTopCustomersProductsAndVendors)

export default router
