import mongoose from 'mongoose'
import { adminDbConnection } from '../../config/dbConnections.js'

import Product from './../sellers/productModel.js'
import Category from './categories/categoryModel.js'
import Brand from './brandModel.js'
import Vendor from '../sellers/vendorModel.js'

// Mapping resourceType to respective models
const resourceModelMap = {
    product: Product,
    category: Category,
    brand: Brand,
    shop: Vendor,
}

const bannerSchema = new mongoose.Schema(
    {
        bannerType: {
            type: String,
            enum: [
                'main-banner',
                'popup-banner',
                'main-section-banner',
                'footer-banner',
            ],
            required: [true, 'Please provide banner type.'],
        },
        resourceType: {
            type: String,
            enum: ['product', 'category', 'brand', 'shop'],
            required: [true, 'Please provide resource type.'],
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Pleaese provide resource id.'],
        },
        url: {
            type: String,
            required: [true, 'Please provide banner url.'],
            unique: true,
        },
        bannerImage: {
            type: String,
            required: [true, 'Please provide banner image'],
        },
        publish: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

bannerSchema.pre(/^find/, function (next) {
    // Get the resourceType and resourceId from the query (or the document in case of save)
    // Or this.resourceType if using save/validate hook
    const resourceType = this.getFilter().resourceType

    // Map the resourceType to the corresponding model
    if (resourceType && resourceModelMap[resourceType]) {
        // Populate the resourceId with the corresponding model based on resourceType
        this.populate({
            path: 'resourceId',
            model: resourceModelMap[resourceType], // Dynamically choose the model
        })
    }

    next()
})

const Banner = adminDbConnection.model('Banner', bannerSchema)

export default Banner
