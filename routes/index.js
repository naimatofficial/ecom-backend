import express from 'express'
import axios from 'axios'

import adminRoutes from './admin/index.js'
import userRoutes from './users/index.js'
import uploadRoutes from './uploadRoutes.js'

import transactionRoutes from './transactions/index.js'
import sellerRoutes from './sellers/index.js'

import { validateSessionToken } from '../middleware/authMiddleware.js'
import { httpSearchProducts } from '../controllers/search.js'
import catchAsync from '../utils/catchAsync.js'

const router = express.Router()

router.get('/', async (req, res) => {
    res.status(200).json({
        status: 'success',
        message: '🛒 API is running successfully',
    })
})

router.post(
    '/location',
    catchAsync(async (req, res) => {
        const { latitude, longitude } = req.body

        // Reverse geocode the coordinates to get city and country
        const { data: geoData } = await axios.get(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
        // const geoData = await geoResponse

        const { data: countries } = await axios.get(
            'https://restcountries.com/v3.1/all'
        )

        const country = countries.find(
            (country) => country.cca2 === geoData.countryCode
        )
        const { flags } = country // Extract the flags property

        res.status(200).json({
            status: 'success',
            city: geoData.city,
            country: geoData.countryName,
            code: geoData.countryCode,
            flags,
        })
    })
)

router.post('/validate-session', validateSessionToken)

router.get('/search', httpSearchProducts)

// Image routes
router.use('/image', uploadRoutes)

// ADMIN DB ROUTES
router.use('/admin', adminRoutes)

// USER DB ROUTES
router.use('/user', userRoutes)

// SELLER DB ROUTES
router.use('/seller', sellerRoutes)

// TRANSACTION DB ROUTES
router.use('/transaction', transactionRoutes)

export default router
