import OrderBusiness from "../../../models/admin/business/orderBusinessModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";


export const createOrderBusiness = createOne(OrderBusiness);

export const getAllOrderBusiness = getAll(OrderBusiness);

export const getOrderBusinessById = getOne(OrderBusiness);

export const updateOrderBusinessById = updateOne(OrderBusiness);

export const deleteOrderBusinessById = deleteOne(OrderBusiness);
