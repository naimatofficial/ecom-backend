import express from 'express'

import flashDeal from './deals/flashDealRoutes.js'
import dealOfDay from './deals/dealOfTheDayRoutes.js'
import featureDeal from './deals/featuredDealRoutes.js'

import brandsRoutes from './brandRoutes.js'
import businessGeneralRoutes from './bussiness/businessGeneralRoutes.js'
import categoryWiseRoutes from './bussiness/categoryWiseRoutes.js'
import customerBusinessRoutes from './bussiness/customerBusinessRoutes.js'
import deliveryManRoutes from './bussiness/deliveryManRoutes.js'
import deliveryRestrictionRoutes from './bussiness/deliveryRestrictionRoutes.js'
import inHouseShopRotes from './bussiness/inHouseShopRoutes.js'
import orderBusinessRoutes from './bussiness/orderBusinessRoutes.js'
import orderWiseRoutes from './bussiness/orderWiseRoutes.js'
import productBusinessRoutes from './bussiness/productBusinessRoutes.js'
import sellerBusinessRoutes from './bussiness/sellerBusinessRoutes.js'
import shippinpMethodRoutes from './bussiness/shippingMethodRoutes.js'
// import notification from './notificationRoutes.js'

import couponRoutes from '../sellers/couponRoutes.js'
import colorRoutes from './colorRoutes.js'
import bannerRoutes from './bannerRoutes.js'
import attributeRoutes from './attributeRoutes.js'
import categoryRoutes from './categories/categoryRoutes.js'
import subCategoryRoutes from './categories/subCategoryRoutes.js'
import subSubCategoryRoutes from './categories/subSubCategoryRoutes.js'

import employeeRoutes from './employeeRoutes.js'
import roleRoutes from './roleRoutes.js'

import pageRoutes from '../admin/pagesAndMedia/pageRoutes.js'
import faqRoutes from '../admin/pagesAndMedia/faqRoutes.js'
import socialMediaRoutes from '../admin/pagesAndMedia/socialMediaRoutes.js'

import { getAdminBusinessAnalytics } from '../../controllers/analytics/bussinessAnalytics.js'
import { protect } from '../../middleware/authMiddleware.js'

const router = express.Router()

router.get('/business-analytics', protect, getAdminBusinessAnalytics)

router.use('/employees', employeeRoutes)
router.use('/roles', roleRoutes)

router.use('/categories', categoryRoutes)
router.use('/sub-categories', subCategoryRoutes)
router.use('/sub-sub-categories', subSubCategoryRoutes)

router.use('/attributes', attributeRoutes)
router.use('/banners', bannerRoutes)
router.use('/colors', colorRoutes)
router.use('/coupons', couponRoutes)
router.use('/brands', brandsRoutes)

//Deals
router.use('/flash-deals', flashDeal)
router.use('/deal-of-day', dealOfDay)
router.use('/featured-deals', featureDeal)

//Business
router.use('/businessgeneral', businessGeneralRoutes)
router.use('/inHouseShop', inHouseShopRotes)
router.use('/orderBusiness', orderBusinessRoutes)
router.use('/orderWise', orderWiseRoutes)
router.use('/productBusiness', productBusinessRoutes)
router.use('/sellerBusiness', sellerBusinessRoutes)
router.use('/shippinpMethod', shippinpMethodRoutes)

// Pages & Media
router.use('/pages', pageRoutes)
router.use('/faqs', faqRoutes)
router.use('/social-media', socialMediaRoutes)

router.use('/categorywise', categoryWiseRoutes)
router.use('/customerBusiness', customerBusinessRoutes)
router.use('/deliveryman', deliveryManRoutes)
router.use('/deliveryRestriction', deliveryRestrictionRoutes)

export default router
