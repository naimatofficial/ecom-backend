import Joi from "joi";

// Joi validation schema for Seller
const sellerBusinessValidationSchema = Joi.object({
  defaultCommission: Joi.number().required().messages({
    "any.required": "Please provide default commission",
  }),

  enablePOSInSellerPanel: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .required()
    .messages({
      "any.required":
        "Please specify if POS in seller panel is active or inactive",
      "any.only":
        "Enable POS in seller panel must be either active or inactive",
    }),

  sellerRegistration: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .required()
    .messages({
      "any.required":
        "Please specify if seller registration is active or inactive",
      "any.only": "Seller registration must be either active or inactive",
    }),

  setMinimumOrderAmount: Joi.string()
    .valid("active", "inactive")
    .default("inactive")
    .required()
    .messages({
      "any.required":
        "Please specify if setting minimum order amount is active or inactive",
      "any.only": "Set minimum order amount must be either active or inactive",
    }),
});

// Export the Joi validation schema
export default sellerBusinessValidationSchema;
