import SubCategory from '../../../models/admin/categories/subCategoryModel.js'

import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    getOneBySlug,
    updateOne,
} from '../../../factory/handleFactory.js'

// Create a new subcategory
export const createSubCategory = createOne(SubCategory)

export const getAllSubCategories = getAll(SubCategory)

// Get a subcategory by ID
export const getSubCategoryById = getOne(SubCategory)
// Get a subcategory by slug
export const getSubCategoryBySlug = getOneBySlug(SubCategory)

export const updateSubCategoryById = updateOne(SubCategory)

// Delete a subcategory by ID
export const deleteSubCategoryById = deleteOne(SubCategory)
