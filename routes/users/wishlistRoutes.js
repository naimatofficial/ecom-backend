import express from 'express'
import { protect } from './../../middleware/authMiddleware.js'
import {
    addProductToWishlist,
    removeProductFromWishlist,
    getWishlist,
    getAllWishlists,
    deleteWishlist,
} from '../../controllers/users/wishlistController.js'

const router = express.Router()

router.get('/', protect, getAllWishlists)

router.post('/add', protect, addProductToWishlist)

router.put('/remove/product/:productId', protect, removeProductFromWishlist)

router
    .route('/:customerId')
    .get(protect, getWishlist)
    .delete(protect, deleteWishlist)

export default router
