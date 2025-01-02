import Joi from 'joi'

const subSubCategoryValidationSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'Please provide sub sub category name.',
        'string.empty': 'Sub sub category name cannot be empty.',
    }),
    mainCategory: Joi.string().required().messages({
        'any.required': 'Please provide main category.',
        'string.empty': 'Main category cannot be empty.',
    }),
    subCategory: Joi.string().required().messages({
        'any.required': 'Please provide sub category.',
        'string.empty': 'Sub category cannot be empty.',
    }),
    priority: Joi.number().optional(),
})

export default subSubCategoryValidationSchema
