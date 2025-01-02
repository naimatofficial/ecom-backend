import express from 'express'

import {
    createModule,
    deleteModule,
    getModuleById,
    getModules,
    updateModule,
} from '../../controllers/admin/moduleController.js'

import { protect, restrictTo } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createModule).get(protect, getModules)

router
    .route('/:id')
    .get(protect, getModuleById)
    .put(protect, updateModule)
    .delete(protect, deleteModule)

export default router
