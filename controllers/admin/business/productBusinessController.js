import ProductBusiness from "../../../models/admin/business/productBusinessModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";

export const createProductBusiness = createOne(ProductBusiness);

export const getAllProductBusiness = getAll(ProductBusiness);

export const getProductBusinessById = getOne(ProductBusiness);

export const updateProductBusinessById = updateOne(ProductBusiness);

export const deleteProductBusinessById = deleteOne(ProductBusiness);
