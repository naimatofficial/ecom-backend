import Joi from "joi";

// Joi validation schema for Product
const productBusinessValidationSchema = Joi.object({
  reorderLevel: Joi.number().integer().min(0).required().messages({
    "number.base": "Reorder level must be a number",
    "number.integer": "Reorder level must be an integer",
    "number.min": "Reorder level must be at least 0",
    "any.required": "Please provide reorder level",
  }),
  sellDigitalProduct: Joi.string()
    .valid("active", "inactive")
    .required()
    .messages({
      "string.base": "Sell digital product status must be a string",
      "any.only":
        "Sell digital product status must be either 'active' or 'inactive'",
      "any.required":
        "Please specify if selling digital product is active or inactive",
    }),
  showBrand: Joi.string().valid("active", "inactive").required().messages({
    "string.base": "Show brand status must be a string",
    "any.only": "Show brand status must be either 'active' or 'inactive'",
    "any.required": "Please specify if showing brand is active or inactive",
  }),
});

export default productBusinessValidationSchema;
