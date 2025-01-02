import Joi from "joi";

// Joi validation schema
const orderWiseValidationSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    "string.base": "Title should be a string",
    "string.empty": "Title cannot be an empty field",
    "any.required": "Title is required",
  }),
  duration: Joi.number().integer().required().messages({
    "number.base": "Duration should be a number",
    "any.required": "Duration is required",
  }),
  cost: Joi.number().required().messages({
    "number.base": "Cost should be a number",
    "any.required": "Cost is required",
  }),
  status: Joi.string().valid("active", "inactive").required().messages({
    "string.base": "Status should be a string",
    "any.only": "Status must be one of ['active', 'inactive']",
    "any.required": "Status is required",
  }),
});

export default orderWiseValidationSchema;
