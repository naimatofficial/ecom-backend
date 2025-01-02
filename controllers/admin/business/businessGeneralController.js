import BusinessGeneral from "../../../models/admin/business/businessGeneralModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";

// Create a new Businesss General
export const createBusinessGeneral = createOne(BusinessGeneral);

// Get All Businesss General
export const getAllBusinessGeneral = getAll(BusinessGeneral);

// Get a Businesss General by ID
export const getBusinessGeneralById = getOne(BusinessGeneral);

//Update 
export const updateBusinessGeneralById = updateOne(BusinessGeneral);

// Delete 
export const deleteBusinessGeneralById = deleteOne(BusinessGeneral);

