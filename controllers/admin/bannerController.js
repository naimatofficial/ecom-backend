import Banner from '../../models/admin/bannerModel.js'
import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
    updatePublishStatus,
} from './../../factory/handleFactory.js'

// Create a new banner
export const createBanner = createOne(Banner)

// Get a banner by ID
export const getBannerById = getOne(Banner)

// Get all banners
export const getBanners = getAll(Banner)

// Update a banner
export const updateBanner = updateOne(Banner)

export const updateBannerPublishStatus = updatePublishStatus(Banner)

// Delete a banner
export const deleteBanner = deleteOne(Banner)
