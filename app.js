import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'

import globalErrorHandler from './controllers/errorController.js'
import AppError from './utils/appError.js'

import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

// ROUTES
import routes from './routes/index.js'

import { cleanCache } from './factory/handleFactory.js'
import helmet from 'helmet'
import ExpressMongoSanitize from 'express-mongo-sanitize'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

const corsOptions = {
    // Allows all origins, CORS will reflect the requesting origin
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
}

// Security headers first
app.use(helmet())
// CORS setup before request handling
app.use(cors(corsOptions))
// Parse JSON request body early
app.use(express.json())
// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }))
// Parse cookies before using them (e.g., for auth)
app.use(cookieParser())
// Sanitize the request after body and cookies are parsed
app.use(ExpressMongoSanitize())

//If you are using a reverse proxy (e.g., Nginx, AWS Load Balancer),
// ensure it is configured to set the x - forwarded -for header.
app.set('trust proxy', true)

// Developing logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: '🛒 Vista Mart API is running successfully',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    })
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API ROUTES
app.use('/api/v1', routes)

// Clear all caches
app.post('/api/v1/clean-cache', cleanCache)

// Unhandled Routes Handling Middleware
app.all('*', (req, res, next) => {
    next(
        new AppError(`Can't find this ${req.originalUrl} on this server.`, 404)
    )
})

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler)

export default app
