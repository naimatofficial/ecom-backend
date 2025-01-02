import Page from './../../../models/admin/pagesAndMedia/pageModel.js'

import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    getOneBySlug,
    updateOne,
} from './../../../factory/handleFactory.js'

// Create a new Page
export const createPage = createOne(Page)
// Get all Pages
export const getPages = getAll(Page)

// Get an Page by ID
export const getPageById = getOne(Page)

export const getPageBySlug = getOneBySlug(Page)

// Update an Page
export const updatePage = updateOne(Page)

// Delete an Page
export const deletePage = deleteOne(Page)
