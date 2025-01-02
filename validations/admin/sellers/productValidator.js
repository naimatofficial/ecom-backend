import Joi from 'joi'

const productValidationSchema = Joi.object({
    name: Joi.string().trim().max(100).required().messages({
        'string.base': 'Product name must be a string',
        'string.max': 'Product name should not exceed 100 characters',
        'any.required': 'Product name is required',
    }),
    description: Joi.string().trim().required().messages({
        'string.base': 'Product description must be a string',
        'any.required': 'Product description is required',
    }),

    category: Joi.string().required().messages({
        'any.required': 'Category is required',
    }),
    subCategory: Joi.string().optional().allow(null, ''),
    subSubCategory: Joi.string().optional().allow(null, ''),

    brand: Joi.string().required().messages({
        'any.required': 'Brand is required',
    }),

    productType: Joi.string()
        .valid('physical', 'digital')
        .default('physical')
        .messages({
            'any.only': 'Product type must be either physical or digital',
        }),

    digitalProductType: Joi.string()
        .valid('readyAfterSell', 'readyProduct')
        .default('readyAfterSell')
        .messages({
            'any.only':
                'Digital product type must be either readyAfterSell or readyProduct',
        }),

    sku: Joi.string().required().messages({
        'any.required': 'SKU is required',
    }),

    unit: Joi.string().required().messages({
        'any.required': 'Unit is required',
    }),

    tags: Joi.array().items(Joi.string()),

    price: Joi.number().min(0).optional().messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
    }),

    discount: Joi.number().min(0).max(100).default(0).messages({
        'number.base': 'Discount must be a number',
        'number.min': 'Discount cannot be negative',
        'number.max': 'Discount cannot exceed 100%',
    }),

    discountType: Joi.string().valid('percent', 'flat').optional(),

    discountAmount: Joi.number().min(0).default(0).messages({
        'number.base': 'Discount amount must be a number',
        'number.min': 'Discount amount cannot be negative',
    }),

    taxAmount: Joi.number().min(0).default(0).messages({
        'number.base': 'Tax amount must be a number',
        'number.min': 'Tax amount cannot be negative',
    }),

    taxIncluded: Joi.boolean().default(false),

    shippingCost: Joi.number().min(0).default(0).messages({
        'number.base': 'Shipping cost must be a number',
        'number.min': 'Shipping cost cannot be negative',
    }),

    minimumOrderQty: Joi.number().min(1).required().messages({
        'number.base': 'Minimum order quantity must be a number',
        'number.min': 'Minimum order quantity must be at least 1',
        'any.required': 'Minimum order quantity is required',
    }),

    stock: Joi.number().min(0).required().messages({
        'number.base': 'Stock must be a number',
        'number.min': 'Stock cannot be negative',
        'any.required': 'Stock is required',
    }),

    isFeatured: Joi.boolean().default(false),

    colors: Joi.array().items(Joi.string()),

    attributes: Joi.array().items(
        Joi.object({
            attribute: Joi.string().required().messages({
                'any.required': 'Attribute is required',
            }),
            price: Joi.number().min(0).optional().messages({
                'number.base': 'Attribute price must be a number',
                'number.min': 'Price cannot be negative',
            }),
        })
    ),

    thumbnail: Joi.string().optional(),

    images: Joi.array().items(Joi.string()),

    videoLink: Joi.string().optional(),

    status: Joi.string()
        .valid('pending', 'approved', 'rejected')
        .default('pending')
        .messages({
            'any.only': 'Status must be either pending, approved, or rejected',
        }),

    userId: Joi.string().required().messages({
        'any.required': 'Owner ID is required',
    }),

    userType: Joi.string().valid('vendor', 'in-house').required().messages({
        'any.required': 'Owner type is required',
        'any.only': 'Owner type must be either vendor or in-house',
    }),

    rating: Joi.number().min(0).max(5).default(0).messages({
        'number.base': 'Rating must be a number',
        'number.min': 'Rating cannot be negative',
        'number.max': 'Rating cannot exceed 5',
    }),

    numOfReviews: Joi.number().min(0).default(0).messages({
        'number.base': 'Number of reviews must be a number',
        'number.min': 'Number of reviews cannot be negative',
    }),

    // New fields
    metaTitle: Joi.string().max(60).optional().messages({
        'string.base': 'Meta title must be a string',
        'string.max': 'Meta title should not exceed 60 characters',
    }),

    metaDescription: Joi.string().max(160).optional().messages({
        'string.base': 'Meta description must be a string',
        'string.max': 'Meta description should not exceed 160 characters',
    }),
})

export default productValidationSchema
