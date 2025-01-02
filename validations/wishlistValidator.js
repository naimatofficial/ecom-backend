import Joi from 'joi'

const wishlistValidationSchema = Joi.object({
    productId: Joi.string().required().messages({
        'any.required': 'Product ID is required',
        'any.base': 'Product ID must be a string',
        'string.empty': 'Product ID cannot be empty.',
    }),
})

export default wishlistValidationSchema
