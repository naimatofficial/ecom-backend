import mongoose from 'mongoose'
import { adminDbConnection } from '../../../config/dbConnections.js'

import Category from './categoryModel.js'
import SubCategory from './subCategoryModel.js'

import { checkReferenceId } from '../../../utils/helpers.js'

const subSubCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide sub sub category name.'],
            unique: true,
            trim: true,
        },
        mainCategory: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide main category.'],
            ref: 'Category',
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide sub category.'],
            ref: 'SubCategory',
        },
        priority: Number,
        slug: {
            type: String,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    }
)

subSubCategorySchema.index({ name: 'text' })

subSubCategorySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'mainCategory subCategory',
        select: 'name',
    })
    next()
})

subSubCategorySchema.pre('save', async function (next) {
    await checkReferenceId(Category, this.mainCategory, next)

    await checkReferenceId(SubCategory, this.subCategory, next)

    next()
})

const SubSubCategory = adminDbConnection.model(
    'SubSubCategory',
    subSubCategorySchema
)

export default SubSubCategory
