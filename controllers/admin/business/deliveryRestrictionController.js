import DeliveryRestriction from "../../../models/admin/business/deliveryRestrictionModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";


export const createDeliveryRestriction = createOne(DeliveryRestriction);

export const getAllDeliveryRestriction = getAll(DeliveryRestriction);

export const getDeliveryRestrictionById = getOne(DeliveryRestriction);

export const updateDeliveryRestrictionById = updateOne(DeliveryRestriction);

export const deleteDeliveryRestrictionById = deleteOne(DeliveryRestriction);
