import Joi from 'joi'

const dealOfTheDayValidationSchema = Joi.object({
    product: Joi.string().required().messages({
        'any.required': 'Product ID is required',
        'string.base': 'Product ID must be a string',
    }),
    title: Joi.string().required().messages({
        'any.required': 'Title is required',
        'string.base': 'Title must be a string',
        'string.empty': 'Title cannot be empty',
    }),
    status: Joi.string()
        .valid('active', 'expired', 'inactive')
        .default('inactive')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Invalid status',
        }),
})

export default dealOfTheDayValidationSchema
