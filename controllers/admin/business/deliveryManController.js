import DeliveryMan from "../../../models/admin/business/deliveryManModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";

export const createDeliveryMan = createOne(DeliveryMan);

export const getAllDeliveryMan = getAll(DeliveryMan);

export const getDeliveryManById = getOne(DeliveryMan);

export const updateDeliveryManById = updateOne(DeliveryMan);

export const deleteDeliveryManById = deleteOne(DeliveryMan);
