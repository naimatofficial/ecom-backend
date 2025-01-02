import express from 'express'
import {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    searchNotifications,
    incrementNotificationCount,
} from '../controllers/notificationController.js'

import { validateSchema } from '../middleware/validationMiddleware.js'
import notificationValidationSchema from './../validations/notificationValidator.js'
import { protect, restrictTo } from '../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .get(protect, getAllNotifications)
    .post(
        protect,
        validateSchema(notificationValidationSchema),
        createNotification
    )

router.route('/search').get(searchNotifications)

router
    .route('/:id')
    .get(getNotificationById)
    .put(protect, updateNotification)
    .delete(protect, deleteNotification)

router.route('/:id/increment').put(protect, incrementNotificationCount)

export default router
