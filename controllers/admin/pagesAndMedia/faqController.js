import FAQ from './../../../models/admin/pagesAndMedia/faqModel.js'

import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './../../../factory/handleFactory.js'

// Create a new FAQ
export const createFAQ = createOne(FAQ)
// Get all FAQs
export const getFAQs = getAll(FAQ)

// Get an FAQ by ID
export const getFAQById = getOne(FAQ)

// Update an FAQ
export const updateFAQ = updateOne(FAQ)

// Delete an FAQ
export const deleteFAQ = deleteOne(FAQ)
