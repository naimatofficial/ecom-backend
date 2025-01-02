import Joi from 'joi'

const orderValidationSchema = Joi.object({
    customerId: Joi.string().required().messages({
        'any.required': 'Customer ID is required',
        'string.base': 'Customer ID must be a string',
    }),

    vendors: Joi.array()
        .items(
            Joi.string().required().messages({
                'any.required': 'Vendor ID is required',
                'string.base': 'Vendor ID must be a string',
            })
        )
        .required()
        .messages({
            'any.required': 'Vendors are required',
        }),
    products: Joi.array()
        .items(
            Joi.object({
                product: Joi.string().required().messages({
                    'any.required': 'Product ID is required',
                    'string.base': 'Product ID must be a string',
                }),
                quantity: Joi.number().integer().min(1).required().messages({
                    'any.required': 'Quantity is required',
                    'number.base': 'Quantity must be a number',
                    'number.min': 'Quantity cannot be less than 1',
                }),
            })
        )
        .required()
        .messages({
            'any.required': 'Products are required',
        }),

    totalAmount: Joi.number().required().messages({
        'any.required': 'Total amount is required',
        'number.base': 'Total amount must be a number',
    }),
    paymentMethod: Joi.string()
        .valid('credit_card', 'jazzCash', 'bank_transfer', 'cash_on_delivery')
        .required()
        .messages({
            'any.required': 'Payment method is required',
            'string.base': 'Payment method must be a string',
            'any.only': 'Invalid payment method',
        }),
    paymentStatus: Joi.string().valid('Unpaid', 'Paid').required().messages({
        'any.required': 'Payment status is required',
        'string.base': 'Payment status must be a string',
        'any.only': 'Invalid payment status',
    }),
    shippingAddress: Joi.object({
        name: Joi.string().required().messages({
            'string.base': 'Name must be a string.',
            'string.empty': 'Please provide a name.',
            'any.required': 'Name is required.',
        }),
        address: Joi.string().required().messages({
            'any.required': 'Shipping address is required',
            'string.base': 'Shipping address must be a string',
            'string.empty': 'Shipping address cannot be empty',
        }),
        city: Joi.string().required().messages({
            'any.required': 'Shipping city is required',
            'string.base': 'Shipping city must be a string',
            'string.empty': 'Shipping city cannot be empty',
        }),
        state: Joi.string().required().messages({
            'any.required': 'Shipping state is required',
            'string.base': 'Shipping state must be a string',
            'string.empty': 'Shipping state cannot be empty',
        }),
        zipCode: Joi.string().required().messages({
            'any.required': 'Shipping zip code is required',
            'string.base': 'Shipping zip code must be a string',
            'string.empty': 'Shipping zip code cannot be empty',
        }),
        country: Joi.string().required().messages({
            'any.required': 'Shipping country is required',
            'string.base': 'Shipping country must be a string',
            'string.empty': 'Shipping country cannot be empty',
        }),
        phoneNumber: Joi.string().optional().allow(''),
    })
        .required()
        .messages({
            'any.required': 'Shipping address is required',
        }),
    billingAddress: Joi.object({
        name: Joi.string().required().messages({
            'string.base': 'Name must be a string.',
            'string.empty': 'Please provide a name.',
            'any.required': 'Name is required.',
        }),
        address: Joi.string().required().messages({
            'any.required': 'Billing address is required',
            'string.base': 'Billing address must be a string',
            'string.empty': 'Billing address cannot be empty',
        }),
        city: Joi.string().required().messages({
            'any.required': 'Billing city is required',
            'string.base': 'Billing city must be a string',
            'string.empty': 'Billing city cannot be empty',
        }),
        state: Joi.string().required().messages({
            'any.required': 'Billing state is required',
            'string.base': 'Billing state must be a string',
            'string.empty': 'Billing state cannot be empty',
        }),
        zipCode: Joi.string().required().messages({
            'any.required': 'Billing zip code is required',
            'string.base': 'Billing zip code must be a string',
            'string.empty': 'Billing zip code cannot be empty',
        }),

        country: Joi.string().required().messages({
            'any.required': 'Billing country is required',
            'string.base': 'Billing country must be a string',
            'string.empty': 'Billing country cannot be empty',
        }),
        phoneNumber: Joi.string().optional().allow(''),
    })
        .required()
        .messages({
            'any.required': 'Billing address is required',
        }),
    orderNote: Joi.string().allow('').messages({
        'string.base': 'Order note must be a string',
    }),
})

export default orderValidationSchema
