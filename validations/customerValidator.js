import Joi from 'joi'

const addressSchema = Joi.object({
    address: Joi.string().required().messages({
        'any.required': 'Address is required',
        'string.base': 'Address must be a string',
        'string.empty': 'Address cannot be empty',
    }),
    city: Joi.string().required().messages({
        'any.required': 'City is required',
        'string.base': 'City must be a string',
        'string.empty': 'City cannot be empty',
    }),
    state: Joi.string().required().messages({
        'any.required': 'State is required',
        'string.base': 'State must be a string',
        'string.empty': 'State cannot be empty',
    }),
    zipCode: Joi.string().required().messages({
        'any.required': 'Zip code is required',
        'string.base': 'Zip code must be a string',
        'string.empty': 'Zip code cannot be empty',
    }),
    country: Joi.string().required().messages({
        'any.required': 'Country is required',
        'string.base': 'Country must be a string',
        'string.empty': 'Country cannot be empty',
    }),
})

const customerValidationSchema = Joi.object({
    firstName: Joi.string().required().messages({
        'any.required': 'First name is required',
        'string.base': 'First name must be a string',
        'string.empty': 'First name cannot be empty',
    }),
    lastName: Joi.string().optional().allow(''),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email address',
        'string.base': 'Email must be a string',
    }),
    phoneNumber: Joi.string().optional().allow(''),
    image: Joi.string().optional().allow(''),
    role: Joi.string().valid('customer').default('customer').messages({
        'string.base': 'Role must be a string',
        'any.only': 'Role must be customer',
    }),
    referCode: Joi.string().optional().allow(''),
    password: Joi.string().min(8).required().messages({
        'any.required': 'Password is required',
        'string.base': 'Password must be a string',
        'string.min': 'Password must be at least 8 characters long',
    }),
    status: Joi.string()
        .valid('active', 'inactive')
        .default('active')
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Status must be either active or inactive',
        }),
    permanentAddress: addressSchema,
    officeShippingAddress: addressSchema,
    officeBillingAddress: addressSchema,
})

export default customerValidationSchema
