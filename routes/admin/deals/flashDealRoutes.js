import express from 'express'
import {
    createFlashDeal,
    getFlashDeals,
    updateFlashDeal,
    addProductToFlashDeal,
    updateFlashDealStatus,
    deleteFlashDeal,
    getFlashDealById,
    removeProductFromFlashDeal,
    updatePublishFlashDeal,
    getLatestFlashDeal,
} from '../../../controllers/admin/deals/flashDealController.js'

import { validateSchema } from '../../../middleware/validationMiddleware.js'
import flashDealValidationSchema from '../../../validations/flashDealValidator.js'

import { protect } from '../../../middleware/authMiddleware.js'
import { restrictTo } from '../../../middleware/authMiddleware.js'

const router = express.Router()

router
    .route('/')
    .post(
        protect,

        validateSchema(flashDealValidationSchema),
        createFlashDeal
    )
    .get(getFlashDeals)

router.get('latest', getLatestFlashDeal)

router
    .route('/:id')
    .get(getFlashDealById)
    .put(protect, updateFlashDeal)
    .delete(protect, deleteFlashDeal)

router.route('/add-product/:id').put(protect, addProductToFlashDeal)

router.route('/remove-product/:id').put(
    protect,

    removeProductFromFlashDeal
)

router.route('/status/:id').put(protect, updateFlashDealStatus)

router.route('/publish/:id').put(protect, updatePublishFlashDeal)

export default router
