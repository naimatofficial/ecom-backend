import express from "express";
import {
  createInHouseShop,
  deleteInHouseShopById,
  getAllInHouseShop,
  getInHouseShopById,
  updateInHouseShopById,
} from "../../../controllers/admin/business/inHouseShopController.js";

import { validateSchema } from "../../../middleware/validationMiddleware.js";
import inHouseShopValidationSchema from "./../../../validations/admin/business/inHouseShopValidator.js";
import { protect, restrictTo } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, restrictTo("admin"), validateSchema(inHouseShopValidationSchema), createInHouseShop)

  .get(getAllInHouseShop);

router
  .route("/:id")
  .get(getInHouseShopById)
  .put(protect, restrictTo("admin"),updateInHouseShopById)
  .delete(protect, restrictTo("admin"),deleteInHouseShopById);

export default router;
