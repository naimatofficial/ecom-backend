import Joi from "joi";

const shippingMethodValidationSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),

  duration: Joi.string().required().messages({
    "any.required": "Duration is required",
    "string.empty": "Duration cannot be empty",
  }),

  cost: Joi.number().required().messages({
    "any.required": "Cost is required",
    "number.base": "Cost must be a valid number",
  }),
});

export default shippingMethodValidationSchema;
