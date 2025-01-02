import SellerBusiness from '../../../models/admin/business/sellerBusinessModel.js'

import {
    createOne,
    deleteOne,
    getAll,
    getOne,
    updateOne,
} from '../../../factory/handleFactory.js'

export const createSellerBusiness = createOne(SellerBusiness)

export const getAllSellerBusiness = getAll(SellerBusiness)

export const getSellerBusinessById = getOne(SellerBusiness)

export const updateSellerBusinessById = updateOne(SellerBusiness)

export const deleteSellerBusinessById = deleteOne(SellerBusiness)
