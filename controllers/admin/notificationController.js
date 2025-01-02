import redisClient from '../config/redisConfig.js'
import Notification from '../models/notificationModel.js'
import catchAsync from '../utils/catchAsync.js'
import { getCacheKey } from '../utils/helpers.js'
import { deleteOne, getAll, getOne } from './handleFactory.js'

// Get all notifications
export const getAllNotifications = getAll(Notification)

// Get a notification by ID
export const getNotificationById = getOne(Notification)

// Delete a notification
export const deleteNotification = deleteOne(Notification)

// Search notifications
export const searchNotifications = catchAsync(async (req, res) => {
    const { query } = req.query // Search query parameter

    const notifications = await Notification.find({
        $or: [
            { title: new RegExp(query, 'i') },
            { description: new RegExp(query, 'i') },
        ],
    })
    // Handle case where the document was not found
    if (!notifications) {
        return next(new AppError('No notification found', 404))
    }

    res.status(200).json({
        status: 'success',
        doc: notifications,
    })
})

// Create a new notification
export const createNotification = catchAsync(async (req, res) => {
    const { title, description, status, image } = req.body

    const doc = await Notification.create({
        title,
        description,
        image,
        status,
    })

    // Update cache
    const cacheKey = getCacheKey(Notification, '', req.query)
    await redisClient.del(cacheKey)

    res.status(201).json({
        status: 'success',
        doc,
    })
})
// Update an existing notification
export const updateNotification = catchAsync(async (req, res) => {
    const { title, description, userLimit, status, image } = req.body

    const updatedNotification = await Notification.findByIdAndUpdate(
        req.params.id,
        { title, description, image, status },
        { new: true }
    )

    if (!updatedNotification) {
        return next(new AppError('No doc found with that ID', 404))
    }

    // Update cache
    const cacheKey = getCacheKey(Notification, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedNotification,
    })
})

// Increment notification count
export const incrementNotificationCount = catchAsync(async (req, res) => {
    const updatedNotification = await Notification.findByIdAndUpdate(
        req.params.id,
        { $inc: { count: 1 } }, // Increment the count field
        { new: true }
    )

    if (!updatedNotification) {
        return next(new AppError('No doc found with that ID', 404))
    }

    // Update cache
    const cacheKey = getCacheKey(Notification, '', req.query)
    await redisClient.del(cacheKey)

    res.status(200).json({
        status: 'success',
        doc: updatedNotification,
    })
})
