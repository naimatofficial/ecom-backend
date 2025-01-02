import express from 'express'
import {
    createFAQ,
    getFAQs,
    getFAQById,
    updateFAQ,
    deleteFAQ,
} from '../../../controllers/admin/pagesAndMedia/faqController.js'
import { protect } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createFAQ).get(getFAQs)
router
    .route('/:id')
    .get(getFAQById)
    .put(protect, updateFAQ)
    .delete(protect, deleteFAQ)

export default router
