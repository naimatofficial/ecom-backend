import Joi from 'joi'

const categoryValidationSchema = Joi.object({
    name: Joi.string().min(1).required().messages({
        'string.base': 'Category name must be a string.',
        'string.empty': 'Please provide a category name.',
        'any.required': 'Category name is required.',
    }),
    logo: Joi.string().min(1).required().allow('').messages({
        'string.base': 'Category logo must be a string.',
        'string.empty': 'Please provide a category logo.',
        'any.required': 'Category logo is required.',
    }),
    priority: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Priority must be a number.',
        'number.integer': 'Priority must be an integer.',
        'number.min': 'Priority must be a non-negative number.',
    }),
})

export default categoryValidationSchema
