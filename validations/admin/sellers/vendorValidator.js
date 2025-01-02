import Joi from 'joi'

const vendorValidationSchema = Joi.object({
    firstName: Joi.string()
        .required()
        .messages({
            'any.required': 'Please tell us your first name.',
            'string.empty': 'First name cannot be empty.',
        })
        .trim(),
    lastName: Joi.string().default('').trim(),
    phoneNumber: Joi.string()
        .required()
        .messages({
            'any.required': 'Please tell us your phone number.',
            'string.empty': 'Phone number cannot be empty.',
        })
        .trim(),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'any.required': 'Please provide your email address.',
            'string.email': 'Please provide a valid email address.',
        })
        .lowercase(),
    password: Joi.string().min(8).required().messages({
        'any.required': 'Please provide a password.',
        'string.min': 'Password must be at least 8 characters long.',
    }),
    shopName: Joi.string()
        .required()
        .messages({
            'any.required': 'Please tell us your shop name.',
            'string.empty': 'Shop name cannot be empty.',
        })
        .trim(),
    address: Joi.string()
        .required()
        .messages({
            'any.required': 'Please provide your address.',
            'string.empty': 'Address cannot be empty.',
        })
        .trim(),

        
    vendorImage: Joi.string().optional(),
    logo: Joi.string().optional(),
    banner: Joi.string().optional(),
})

export default vendorValidationSchema
