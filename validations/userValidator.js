import Joi from 'joi'

const userValidationSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            'any.required': 'Please tell us your name.',
            'string.empty': 'Name cannot be empty.',
        })
        .trim(),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'any.required': 'Please provide your email address.',
            'string.email': 'Please provide a valid email address.',
        })
        .lowercase()
        .trim(),
    phoneNumber: Joi.string().optional(),
    image: Joi.string().optional(),
    password: Joi.string().min(8).required().messages({
        'any.required': 'Please provide a password.',
        'string.min': 'Password must be at least 8 characters long.',
        'string.empty': 'Password cannot be empty.',
    }),
})

export default userValidationSchema
