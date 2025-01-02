import InHouseShop from "../../../models/admin/business/inHouseShopModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";


export const createInHouseShop = createOne(InHouseShop);

export const getAllInHouseShop = getAll(InHouseShop);

export const getInHouseShopById = getOne(InHouseShop);

export const updateInHouseShopById = updateOne(InHouseShop);

export const deleteInHouseShopById = deleteOne(InHouseShop);
