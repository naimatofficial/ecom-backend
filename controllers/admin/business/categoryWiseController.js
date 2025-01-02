import CategoryWise from "../../../models/admin/business/categoryWiseModel.js";

import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from "../../../factory/handleFactory.js";

// Create 
export const createCategoryWise = createOne(CategoryWise);
//Get All
export const getAllCategoryWise = getAll(CategoryWise);

// Get by ID
export const getCategoryWiseById = getOne(CategoryWise);

//Update
export const updateCategoryWiseById = updateOne(CategoryWise);

// Delete by ID
export const deleteCategoryWiseById = deleteOne(CategoryWise);
