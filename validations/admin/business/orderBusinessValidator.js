import Joi from "joi";

const orderBusinessValidationSchema = Joi.object({
  orderDeliveryVerification: Joi.string()
    .valid("active", "inactive")
    .required()
    .messages({
      "any.required":
        "Please specify if order delivery verification is active or inactive.",
      "any.only":
        "Order delivery verification must be either active or inactive.",
    }),
  minimumOrderAmount: Joi.string()
    .valid("active", "inactive")
    .required()
    .messages({
      "any.required":
        "Please specify if minimum order amount is active or inactive.",
      "any.only": "Minimum order amount must be either active or inactive.",
    }),
  showBillingAddressInCheckout: Joi.string()
    .valid("active", "inactive")
    .required()
    .messages({
      "any.required":
        "Please specify if showing billing address in checkout is active or inactive.",
      "any.only":
        "Billing address visibility must be either active or inactive.",
    }),
  freeDelivery: Joi.string().valid("active", "inactive").required().messages({
    "any.required": "Please specify if free delivery is active or inactive.",
    "any.only": "Free delivery must be either active or inactive.",
  }),
  freeDeliveryResponsibility: Joi.string()
    .valid("admin", "seller")
    .required()
    .messages({
      "any.required":
        "Please specify if free delivery responsibility is admin or seller.",
      "any.only":
        "Free delivery responsibility must be either admin or seller.",
    }),
  freeDeliveryOver: Joi.number().min(0).required().messages({
    "any.required": "Please provide the amount for free delivery.",
    "number.base": "Free delivery amount must be a number.",
    "number.min": "Free delivery amount must be 0 or greater.",
  }),
  refundOrderValidityDays: Joi.number().min(0).required().messages({
    "any.required":
      "Please provide the number of days for refund order validity.",
    "number.base": "Refund order validity days must be a number.",
    "number.min": "Refund order validity days must be 0 or greater.",
  }),
  guestCheckout: Joi.string().valid("active", "inactive").required().messages({
    "any.required": "Please specify if guest checkout is active or inactive.",
    "any.only": "Guest checkout must be either active or inactive.",
  }),
});

export default orderBusinessValidationSchema;
