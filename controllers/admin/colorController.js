import Color from './../../models/admin/colorModel.js'

import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './../../factory/handleFactory.js'

// Create a new color
export const createColor = createOne(Color)

// Get all colors
export const getColors = getAll(Color)

// Get a single color by ID
export const getColorById = getOne(Color)

// Update a color by ID
export const updateColor = updateOne(Color)

// Delete a color by ID
export const deleteColor = deleteOne(Color)
