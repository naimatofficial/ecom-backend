import keys from '../config/keys.js'
import AppError from './../utils/appError.js'

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400)
}

const handleDuplicateFieldDB = (err) => {
    const valueMatch = err.message.match(/(["'])(.*?)\1/)
    let str = valueMatch ? valueMatch[0] : ''

    const value = str.replace(/["\\]/g, '')

    const message = `Duplicate field value ${value}, please use another value.`
    return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message)
    const message = `Invalid input data: ${errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWTError = () =>
    new AppError('Invalid Token! Please log in again.', 401)

const handleJWTExpiredError = () =>
    new AppError('Your Token has expired! Please log in again.', 401)

const sendErrorDev = (err, res) => {
    // Log the error
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    } else {
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        })
    }
}

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (keys.nodeEnv === 'development') {
        sendErrorDev(err, res)
    } else if (keys.nodeEnv === 'production') {
        let error

        if (err.name === 'CastError') {
            error = handleCastErrorDB(err)
        }
        if (err.code === 11000) {
            error = handleDuplicateFieldDB(err)
        }
        if (err.name === 'ValidationError') {
            error = handleValidationErrorDB(err)
        }
        if (err.name === 'JsonWebTokenError') error = handleJWTError()
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError()

        if (error) {
            sendErrorProd(error, res)
        } else {
            sendErrorProd(err, res)
        }
    }
}
