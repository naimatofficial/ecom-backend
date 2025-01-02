import SocialMedia from '../../../models/admin/pagesAndMedia/socialMediaModel.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from './../../../factory/handleFactory.js'

// Create a new SocialMedia
export const createSocialMedia = createOne(SocialMedia)
// Get all SocialMedias
export const getSocialMedias = getAll(SocialMedia)

// Get an SocialMedia by ID
export const getSocialMediaById = getOne(SocialMedia)

// Update an SocialMedia
export const updateSocialMedia = updateOne(SocialMedia)

// Delete an SocialMedia
export const deleteSocialMedia = deleteOne(SocialMedia)
