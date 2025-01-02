import Attribute from './../../models/admin/attributeModel.js'

import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './../../factory/handleFactory.js'

// Create a new attribute
export const createAttribute = createOne(Attribute)
// Get all attributes
export const getAttributes = getAll(Attribute)

// Get an attribute by ID
export const getAttributeById = getOne(Attribute)

// Update an attribute
export const updateAttribute = updateOne(Attribute)

// Delete an attribute
export const deleteAttribute = deleteOne(Attribute)
