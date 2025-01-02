import express from "express";
import {
  createDeliveryRestriction,
  getAllDeliveryRestriction,
  updateDeliveryRestrictionById,
  getDeliveryRestrictionById,
  deleteDeliveryRestrictionById,
} from "../../../controllers/admin/business/deliveryRestrictionController.js";

import { validateSchema } from "../../../middleware/validationMiddleware.js";
import deliveryRestrictionValidationSchema from "./../../../validations/admin/business/deliveryRestrictionValidator.js";
import { protect, restrictTo } from "../../../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(
    protect, restrictTo("admin"),
    validateSchema(deliveryRestrictionValidationSchema),
    createDeliveryRestriction
  )

  .get(getAllDeliveryRestriction);

router
  .route("/:id")
  .get(getDeliveryRestrictionById)
  .put(protect, restrictTo("admin"),updateDeliveryRestrictionById)
  .delete(protect, restrictTo("admin"),deleteDeliveryRestrictionById);

export default router;
