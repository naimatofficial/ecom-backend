import Joi from 'joi'

const subscriberValidationSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.base': 'Email must be a string.',
            'string.empty': 'Please provide your email address.',
            'string.email': 'Please provide a valid email address.',
            'any.required': 'Email is required.',
        })
        .lowercase(),
})

export default subscriberValidationSchema
