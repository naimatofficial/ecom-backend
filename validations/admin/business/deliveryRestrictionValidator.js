import Joi from "joi";

const deliveryRestrictionValidationSchema = Joi.object({
  deliveryAvailableCountry: Joi.string()
    .valid("active", "inactive")
    .required()
    .messages({
      "any.required": "Please specify if delivery is available by country.",
      "string.base": "Delivery availability by country must be a string.",
      "any.only":
        "Delivery availability by country must be either active or inactive.",
    }),
  deliveryAvailableZipCodeArea: Joi.string()
    .valid("active", "inactive")
    .required()
    .messages({
      "any.required":
        "Please specify if delivery is available by zip code area.",
      "string.base": "Delivery availability by zip code area must be a string.",
      "any.only":
        "Delivery availability by zip code area must be either active or inactive.",
    }),
});

export default deliveryRestrictionValidationSchema;
