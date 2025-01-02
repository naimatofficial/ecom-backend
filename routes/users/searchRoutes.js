import express from 'express'
import {
    searchAll,
    searchProducts,
} from '../../controllers/users/searchController.js'

const router = express.Router()

router.get('/', searchAll)

router.get('/products', searchProducts)

export default router
