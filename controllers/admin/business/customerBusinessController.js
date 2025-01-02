import CustomerBusiness from "../../../models/admin/business/customerBusinessModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";


export const createCustomerBusiness = createOne(CustomerBusiness);

export const getAllCustomerBusiness = getAll(CustomerBusiness);

export const getCustomerBusinessById = getOne(CustomerBusiness);

export const updateCustomerBusinessById = updateOne(CustomerBusiness);

export const deleteCustomerBusinessById = deleteOne(CustomerBusiness);
