import Joi from 'joi'

const brandValidationSchema = Joi.object({
    name: Joi.string().min(1).required().messages({
        'string.base': 'Brand name must be a string.',
        'string.empty': 'Please provide a brand name.',
        'any.required': 'Brand name is required.',
    }),
    logo: Joi.string().min(1).required().allow('').messages({
        'string.base': 'Brand logo must be a string.',
        'string.empty': 'Please provide a brand logo.',
        'any.required': 'Brand logo is required.',
    }),
    imageAltText: Joi.string().min(1).required().messages({
        'string.base': 'Image alt text must be a string.',
        'string.empty': 'Please provide image alt text.',
        'any.required': 'Image alt text is required.',
    }),
    status: Joi.string()
        .valid('active', 'inactive')
        .default('inactive')
        .messages({
            'string.base': 'Status must be a string.',
            'any.only': 'Status must be either "active" or "inactive".',
        }),
})

export default brandValidationSchema
