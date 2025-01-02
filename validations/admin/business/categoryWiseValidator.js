import Joi from "joi";

const categoryWiseValidationSchema = Joi.object({
  image: Joi.string().required().messages({
    "any.required": "Image is required",
    "string.base": "Image must be a string",
    "string.empty": "Image cannot be empty",
  }),
  categoryName: Joi.string().required().messages({
    "any.required": "Category name is required",
    "string.base": "Category name must be a string",
    "string.empty": "Category name cannot be empty",
  }),
  costPerProduct: Joi.number().required().messages({
    "any.required": "Cost per product is required",
    "number.base": "Cost per product must be a number",
  }),
  status: Joi.string()
    .valid("active", "inactive")
    .default("active")
    .required()
    .messages({
      "any.required": "Status is required",
      "string.base": "Status must be a string",
      "any.only": "Status must be either active or inactive",
    }),
});

export default categoryWiseValidationSchema;
