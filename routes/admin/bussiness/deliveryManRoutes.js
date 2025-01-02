import express from "express";
import { createDeliveryMan, deleteDeliveryManById, getAllDeliveryMan, getDeliveryManById, updateDeliveryManById } from "../../../controllers/admin/business/deliveryManController.js";

import { validateSchema } from "../../../middleware/validationMiddleware.js";
import deliveryManValidationSchema from "./../../../validations/admin/business/deliveryManValidator.js";
import { protect, restrictTo } from "../../../middleware/authMiddleware.js";
const router = express.Router();

router
  .route("/")
  .post(
    protect, restrictTo("admin"),
    validateSchema(deliveryManValidationSchema),
    createDeliveryMan
  )

  .get(getAllDeliveryMan);

router
  .route("/:id")
  .get(getDeliveryManById)
  .put(protect, restrictTo("admin"),updateDeliveryManById)
  .delete(protect, restrictTo("admin"),deleteDeliveryManById);

export default router;
