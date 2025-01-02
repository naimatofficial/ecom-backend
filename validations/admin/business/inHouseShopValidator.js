import Joi from "joi";

const inHouseShopValidationSchema = Joi.object({
  shopCoverImage: Joi.string().uri().required().messages({
    "any.required": "Please provide shop cover image.",
    "string.base": "Shop cover image must be a string.",
    "string.uri": "Shop cover image must be a valid URI.",
  }),
  visitWebsiteLink: Joi.string().uri().required().messages({
    "any.required": "Please provide website link.",
    "string.base": "Website link must be a string.",
    "string.uri": "Website link must be a valid URI.",
  }),
});

export default inHouseShopValidationSchema;
