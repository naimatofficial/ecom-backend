import Joi from 'joi'

const subCategoryValidationSchema = Joi.object({
    name: Joi.string().required().messages({
        'string.base': 'Sub category name must be a string.',
        'string.empty': 'Please provide a sub category name.',
        'any.required': 'Sub category name is required.',
    }),
    mainCategory: Joi.string().required().messages({
        'string.base': 'Main category must be a string.',
        'string.empty': 'Please provide the main category.',
        'any.required': 'Main category is required.',
    }),
    priority: Joi.number().integer().optional().messages({
        'number.base': 'Priority must be a number.',
        'number.integer': 'Priority must be an integer.',
    }),
})

export default subCategoryValidationSchema
