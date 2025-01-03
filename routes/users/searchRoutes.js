import express from 'express'
import {
    // searchAll,
    searchProducts,
    searchProductSuggestions,
} from '../../controllers/users/searchController.js'

const router = express.Router()

router.get('/suggestions', searchProductSuggestions)

router.get('/products', searchProducts)

export default router
