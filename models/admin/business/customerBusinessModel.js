import mongoose from "mongoose";
import { adminDbConnection } from "../../../config/dbConnections.js";

const customerSchema = new mongoose.Schema(
  {
    customerWallet: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [
        true,
        "Please specify if customer wallet is active or inactive",
      ],
    },
    customerLoyaltyPoint: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [
        true,
        "Please specify if customer loyalty point is active or inactive",
      ],
    },
    customerReferrerEarning: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
      required: [
        true,
        "Please specify if customer referrer earning is active or inactive",
      ],
    },
    addRefundAmountToWallet: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: [
        true,
        "Please specify if adding refund amount to wallet is active or inactive",
      ],
    },
    addFundToWallet: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: [
        true,
        "Please specify if adding funds to wallet is active or inactive",
      ],
    },
    minimumAddFundAmount: {
      type: Number,
      default: 200,
      required: [
        true,
        "Please provide the minimum amount to add to the wallet",
      ],
    },
    maximumAddFundAmount: {
      type: Number,
      default: 5000,
      required: [
        true,
        "Please provide the maximum amount to add to the wallet",
      ],
    },
    equivalentPointToOneUnitCurrency: {
      type: Number,
      default: 0,
      required: [
        true,
        "Please provide the equivalent points for 1 unit of currency",
      ],
    },
    loyaltyPointEarnOnEachOrder: {
      type: Number,
      default: 0,
      required: [
        true,
        "Please provide the percentage of loyalty points earned on each order",
      ],
    },
    minimumPointRequiredToConvert: {
      type: Number,
      default: 0,
      required: [true, "Please provide the minimum points required to convert"],
    },
    earningsToEachReferral: {
      type: Number,
      default: 50,
      required: [true, "Please provide the earnings amount for each referral"],
    },
  },
  {
    timestamps: true,
  }
);

const CustomerBusiness = adminDbConnection.model("CustomerBusiness", customerSchema);

export default CustomerBusiness;
