import mongoose from "mongoose";
import { transactionDbConnection } from "../../config/dbConnections.js";
import { checkReferenceId } from "../../utils/helpers.js";
import Order from "./orderModel.js";

const refundSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Please provide order Id."],
    },
    reason: {
      type: String,
      required: [true, "Please provide reason."],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "refunded", "rejected"],
      default: "pending",
    },
    statusReason: {
      type: String,
    },
  },
  { timestamps: true }
);

refundSchema.pre(/^find/, function (next) {
  this.populate({
    path: "order",
    select: "-__v -createdAt -updatedAt",
  });
  next();
});

refundSchema.pre("save", async function (next) {
  await checkReferenceId(Order, this.order, next);
});

const Refund = transactionDbConnection.model("Refund", refundSchema);

export default Refund;
