import express from 'express'
import {
    createSocialMedia,
    getSocialMedias,
    getSocialMediaById,
    updateSocialMedia,
    deleteSocialMedia,
} from '../../../controllers/admin/pagesAndMedia/socialMediaController.js'
import { protect } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createSocialMedia).get(getSocialMedias)
router
    .route('/:id')
    .get(getSocialMediaById)
    .put(protect, updateSocialMedia)
    .delete(protect, deleteSocialMedia)

export default router
