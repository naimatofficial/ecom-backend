import express from 'express'
import {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    getOrderByCustomer,
    getOrderStatus,
    getOrderDetailsByOderId,
    updateOrderById,
} from '../../controllers/transactions/orderControllers.js'
import { validateSchema } from '../../middleware/validationMiddleware.js'
import orderValidationSchema from '../../validations/admin/transactions/orderValidator.js'
import { protect } from '../../middleware/authMiddleware.js'
import { restrictTo } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createOrder).get(protect, getAllOrders)

router.get('/customer/:customerId', getOrderByCustomer)

router.route('/:id').get(protect, getOrderById).delete(protect, deleteOrder)

router.route('/details/:orderId').get(protect, getOrderDetailsByOderId)

router.get('/track-order/:orderId', getOrderStatus)

router.put('/:id', protect, updateOrderById)

router.route('/status/:id').put(protect, updateOrderStatus)

export default router
