// Import dependencies
// import WebSocket from 'ws'

import { WebSocketServer } from 'ws'
import catchAsync from '../utils/catchAsync.js'
import Product from '../models/sellers/productModel.js'
import redisClient from '../config/redisConfig.js'

// Create WebSocket server
const wsServer = new WebSocketServer({ port: 8080 })

// WebSocket connections map
const clients = new Set()

// Handle WebSocket connections
wsServer.on('connection', (ws) => {
    clients.add(ws)

    ws.on('message', async (message) => {
        try {
            const { type, query, limit, filters } = JSON.parse(message)

            if (type === 'suggestions') {
                // Handle suggestions
                const suggestions = await getSuggestions(query, filters, limit)
                ws.send(JSON.stringify({ type: 'suggestions', suggestions }))
            } else if (type === 'search') {
                // Handle search
                const searchResults = await searchProducts(
                    query,
                    filters,
                    limit
                )
                ws.send(JSON.stringify({ type: 'search', searchResults }))
            }
        } catch (error) {
            console.error('WebSocket error:', error)
            ws.send(
                JSON.stringify({
                    error: 'Invalid request format or internal error',
                })
            )
        }
    })

    ws.on('close', () => clients.delete(ws))
})

/**
 * Helper function to get suggestions
 */
async function getSuggestions(query, filters, limit = 5) {
    try {
        const regexQuery = query ? { $regex: query, $options: 'i' } : {}
        const suggestions = await Product.find({
            $or: [{ name: regexQuery }, { description: regexQuery }],
            ...filters,
        })
            .limit(limit)
            .select('name') // Return only the name field for suggestions
        return suggestions
    } catch (error) {
        console.error('Error fetching suggestions:', error)
        return []
    }
}

/**
 * Helper function to search products
 */
async function searchProducts(query, filters = {}, limit = 10, page = 1) {
    try {
        const cacheKey = `cache:Search:${query}:${JSON.stringify(
            filters
        )}:${page}:${limit}`
        const cachedResults = await redisClient.get(cacheKey)

        if (cachedResults) {
            return JSON.parse(cachedResults)
        }

        const offset = (page - 1) * limit
        const regexQuery = query ? { $regex: query, $options: 'i' } : {}
        const totalProducts = await Product.countDocuments({
            $or: [{ name: regexQuery }, { description: regexQuery }],
            ...filters,
        })

        console.log(regexQuery)

        // const products = await Product.find({
        //     $or: [{ name: regexQuery }, { description: regexQuery }],
        //     ...filters,
        // })
        //     .skip(offset)
        //     .limit(limit)
        //     .sort({ updatedAt: -1 })

        const products = await Product.aggregate([
            {
                $match: {
                    name: { $regex: regexQuery, $options: 'i' },
                },
            },
        ])

        const response = {
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products,
        }

        // Cache response
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response))
        return response
    } catch (error) {
        console.error('Error during product search:', error)
        return { error: 'Failed to perform search' }
    }
}

/**
 * HTTP route for product search (fallback for non-WebSocket clients)
 */
export const httpSearchProducts = catchAsync(async (req, res) => {
    const { query, page, limit, ...filters } = req.query

    const response = await searchProducts(
        query,
        filters,
        parseInt(limit, 10) || 10,
        parseInt(page, 10) || 1
    )

    if (response.error) {
        return res
            .status(500)
            .json({ status: 'error', message: response.error })
    }

    res.status(200).json({ status: 'success', data: response })
})
