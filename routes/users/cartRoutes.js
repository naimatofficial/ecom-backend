import express from 'express'
import {
    addOrUpdateCart,
    getCartByCustomer,
} from '../../controllers/users/cartController.js'

const router = express.Router()

router.get('/customer/:customerId', getCartByCustomer)

router.post('/add-to-cart', addOrUpdateCart)

export default router
