import express from 'express'

import { protect } from './../../middleware/authMiddleware.js'

import {
    createInnovationExport,
    deleteInnovationExport,
    getInnovationExports,
    getInnovationExportById,
    updateInnovationExport,
} from '../../controllers/users/innovationExportController.js'

const router = express.Router()

router
    .route('/')
    .post(createInnovationExport)
    .get(protect, getInnovationExports)

router
    .route('/:id')
    .get(protect, getInnovationExportById)
    .put(protect, updateInnovationExport)
    .delete(protect, deleteInnovationExport)

export default router
