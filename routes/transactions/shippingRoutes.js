import express from 'express'
import { calculateShippingCharges } from '../../controllers/transactions/shippingController.js'

const router = express.Router()

router.post('/calculate-price', calculateShippingCharges)

export default router
