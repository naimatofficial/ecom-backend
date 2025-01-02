import express from 'express'
import {
    createPage,
    getPages,
    getPageById,
    updatePage,
    deletePage,
    getPageBySlug,
} from '../../../controllers/admin/pagesAndMedia/pageController.js'
import { protect } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createPage).get(getPages)

router.get('/slug/:slug', getPageBySlug)

router
    .route('/:id')
    .get(getPageById)
    .put(protect, updatePage)
    .delete(protect, deletePage)

export default router
