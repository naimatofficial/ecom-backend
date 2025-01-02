import Joi from 'joi'

const bannerValidationSchema = Joi.object({
    bannerType: Joi.string().required().messages({
        'any.required': 'Please provide banner type.',
        'string.empty': 'Banner type cannot be empty.',
    }),
    resourceType: Joi.string()
        .valid('product', 'category', 'brand', 'shop')
        .required()
        .messages({
            'any.required': 'Please provide resource type.',
            'string.empty': 'Resource type cannot be empty.',
            'any.only':
                'Resource type must be one of [product, category, brand, shop].',
        }),
    resourceId: Joi.string().required().messages({
        'any.required': 'Please provide resource ID.',
        'string.empty': 'Resource ID cannot be empty.',
    }),
    url: Joi.string()
        .uri() // Ensure it's a valid URL format
        .required()
        .messages({
            'any.required': 'Please provide banner URL.',
            'string.empty': 'Banner URL cannot be empty.',
            'string.uri': 'Please provide a valid URL.',
        }),
    bannerImage: Joi.string().required().messages({
        'any.required': 'Please provide banner image.',
        'string.empty': 'Banner image cannot be empty.',
    }),
    publish: Joi.boolean().default(false),
})

export default bannerValidationSchema
