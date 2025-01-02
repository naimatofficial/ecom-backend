import OrderWise from "../../../models/admin/business/orderwiseModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";


export const createOrderWise = createOne(OrderWise);

export const getAllOrderWise = getAll(OrderWise);

export const getOrderWiseById = getOne(OrderWise);

export const updateOrderWiseById = updateOne(OrderWise);

export const deleteOrderWiseById = deleteOne(OrderWise);
