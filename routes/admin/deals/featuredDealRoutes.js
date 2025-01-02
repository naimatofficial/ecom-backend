import express from 'express'
import {
    createFeaturedDeal,
    getFeaturedDeals,
    updateFeaturedDeal,
    addProductToFeaturedDeal,
    updateFeaturedDealStatus,
    deleteFeaturedDeal,
    getFeaturedDealById,
    removeProductFromFeaturedDeal,
} from '../../../controllers/admin/deals/featuredDealController.js'
import { validateSchema } from '../../../middleware/validationMiddleware.js'
import featuredDealValidationSchema from '../../../validations/featuredDealValidator.js'
import { protect } from '../../../middleware/authMiddleware.js'
import { restrictTo } from '../../../middleware/authMiddleware.js'

const router = express.Router()
router
    .route('/')
    .post(
        protect,

        validateSchema(featuredDealValidationSchema),
        createFeaturedDeal
    )
    .get(getFeaturedDeals)

router
    .route('/:id')
    .get(getFeaturedDealById)
    .delete(protect, deleteFeaturedDeal)
    .put(protect, updateFeaturedDeal)

router.route('/add-product/:id').put(protect, addProductToFeaturedDeal)

router.route('/status/:id').put(protect, updateFeaturedDealStatus)

router.route('/remove-product/:id').delete(
    protect,

    removeProductFromFeaturedDeal
)

export default router
