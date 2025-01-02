import Joi from "joi";

const customerBusinessValidationSchema = Joi.object({
  customerWallet: Joi.string()
    .valid("active", "inactive")
    .default("inactive")
    .required()
    .messages({
      "any.required": "Please specify if customer wallet is active or inactive",
      "string.base": "Customer wallet status must be a string",
      "any.only": "Customer wallet status must be either active or inactive",
    }),
  customerLoyaltyPoint: Joi.string()
    .valid("active", "inactive")
    .default("inactive")
    .required()
    .messages({
      "any.required":
        "Please specify if customer loyalty point is active or inactive",
      "string.base": "Customer loyalty point status must be a string",
      "any.only":
        "Customer loyalty point status must be either active or inactive",
    }),
  customerReferrerEarning: Joi.string()
    .valid("active", "inactive")
    .default("inactive")
    .required()
    .messages({
      "any.required":
        "Please specify if customer referrer earning is active or inactive",
      "string.base": "Customer referrer earning status must be a string",
      "any.only":
        "Customer referrer earning status must be either active or inactive",
    }),
  addRefundAmountToWallet: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .required()
    .messages({
      "any.required":
        "Please specify if adding refund amount to wallet is active or inactive",
      "string.base": "Add refund amount to wallet status must be a string",
      "any.only":
        "Add refund amount to wallet status must be either active or inactive",
    }),
  addFundToWallet: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .required()
    .messages({
      "any.required":
        "Please specify if adding funds to wallet is active or inactive",
      "string.base": "Add funds to wallet status must be a string",
      "any.only":
        "Add funds to wallet status must be either active or inactive",
    }),
  minimumAddFundAmount: Joi.number().min(0).default(200).required().messages({
    "any.required": "Please provide the minimum amount to add to the wallet",
    "number.base": "Minimum add fund amount must be a number",
    "number.min": "Minimum add fund amount cannot be negative",
  }),
  maximumAddFundAmount: Joi.number()
    .min(Joi.ref("minimumAddFundAmount"))
    .default(5000)
    .required()
    .messages({
      "any.required": "Please provide the maximum amount to add to the wallet",
      "number.base": "Maximum add fund amount must be a number",
      "number.min":
        "Maximum add fund amount must be greater than or equal to the minimum add fund amount",
    }),
  equivalentPointToOneUnitCurrency: Joi.number()
    .min(0)
    .default(0)
    .required()
    .messages({
      "any.required":
        "Please provide the equivalent points for 1 unit of currency",
      "number.base": "Equivalent points must be a number",
      "number.min": "Equivalent points cannot be negative",
    }),
    loyaltyPointEarnOnEachOrder: Joi.number().min(0).default(0).required().messages({
    "any.required":
      "Please provide the percentage of loyalty points earned on each order",
    "number.base": "Loyalty points earned on each order must be a number",
    "number.min": "Loyalty points percentage cannot be negative",
  }),
  minimumPointRequiredToConvert: Joi.number()
    .min(0)
    .default(0)
    .required()
    .messages({
      "any.required": "Please provide the minimum points required to convert",
      "number.base": "Minimum points required must be a number",
      "number.min": "Minimum points required cannot be negative",
    }),
  earningsToEachReferral: Joi.number().min(0).default(50).required().messages({
    "any.required": "Please provide the earnings amount for each referral",
    "number.base": "Earnings amount must be a number",
    "number.min": "Earnings amount cannot be negative",
  }),
});

export default customerBusinessValidationSchema;
