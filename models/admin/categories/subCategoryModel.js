import mongoose from 'mongoose'
import { checkReferenceId } from '../../../utils/helpers.js'
import { adminDbConnection } from '../../../config/dbConnections.js'
import Category from './categoryModel.js'

const subCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide sub category name.'],
            unique: true,
            trim: true,
        },
        mainCategory: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Please provide main category.'],
            ref: 'Category',
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

subCategorySchema.index({ name: 'text' })

subCategorySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'mainCategory',
        select: 'name',
    })
    next()
})

subCategorySchema.pre('save', async function (next) {
    await checkReferenceId(Category, this.mainCategory, next)
    next()
})

const SubCategory = adminDbConnection.model('SubCategory', subCategorySchema)

export default SubCategory
