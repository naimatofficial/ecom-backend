import Joi from 'joi'

const refundValidationSchema = Joi.object({
    order: Joi.string().required().messages({
        'string.base': 'Order ID must be a string.',
        'string.empty': 'Please provide an order ID.',
        'any.required': 'Order ID is required.',
    }),

    statusReason: Joi.string().optional().allow(''),
    reason: Joi.string().min(1).required().messages({
        'string.base': 'Reason must be a string.',
        'string.empty': 'Please provide a reason.',
        'any.required': 'Reason is required.',
    }),
})

export default refundValidationSchema
