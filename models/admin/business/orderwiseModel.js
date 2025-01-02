import mongoose from "mongoose";
import { adminDbConnection } from "../../../config/dbConnections.js";

const orderWiseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [true, "Status is required"],
    },
  },
  {
    timestamps: true,
  }
);

const OrderWise = adminDbConnection.model("OrderWise", orderWiseSchema);

export default OrderWise;
