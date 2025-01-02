import ShippingMethod from "../../../models/admin/business/shippingMethodModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";

export const createShippingMethod = createOne(ShippingMethod);

export const getAllShippingMethod = getAll(ShippingMethod);

export const getShippingMethodById = getOne(ShippingMethod);

export const updateShippingMethodById = updateOne(ShippingMethod);

export const deleteShippingMethodById = deleteOne(ShippingMethod);
