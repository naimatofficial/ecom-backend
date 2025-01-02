import mongoose from "mongoose";
import { adminDbConnection } from "../../../config/dbConnections.js";

const orderBusinessSchema = new mongoose.Schema(
  {
    orderDeliveryVerification: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [
        true,
        "Please specify if order delivery verification is active or inactive",
      ],
    },
    minimumOrderAmount: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [
        true,
        "Please specify if minimum order amount is active or inactive",
      ],
    },
    showBillingAddressInCheckout: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: [
        true,
        "Please specify if showing billing address in checkout is active or inactive",
      ],
    },
    freeDelivery: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [true, "Please specify if free delivery is active or inactive"],
    },
    freeDeliveryResponsibility: {
      type: String,
      enum: ["admin", "seller"],
      default: "admin",
      required: [
        true,
        "Please specify if free delivery responsibility is admin or seller",
      ],
    },
    freeDeliveryOver: {
      type: Number,
      default: 0,
      required: [true, "Please provide the amount for free delivery"],
    },
    refundOrderValidityDays: {
      type: Number,
      default: 0,
      required: [
        true,
        "Please provide the number of days for refund order validity",
      ],
    },
    guestCheckout: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [
        true,
        "Please specify if guest checkout is active or inactive",
      ],
    },
    shippingMethod:{
      type: String,
      enum:["Leopards","Track"],
      required: true
    },
  },
  {
    timestamps: true,
  }
);

// Create the model using adminDbConnection
const OrderBusiness = adminDbConnection.model(
  "OrderBusiness",
  orderBusinessSchema
);

export default OrderBusiness;
