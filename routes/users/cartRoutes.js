import express from 'express'
import {
    addToCartController,
    deleteCart,
} from '../../controllers/users/cartController.js'

const router = express.Router()

// router.get('/customer/:customerId', getCartByCustomer)

router.post('/add-to-cart', addToCartController)
router.delete('/:id', deleteCart)

export default router
