import Joi from 'joi'

const colorValidationSchema = Joi.object({
    name: Joi.string().min(1).required().messages({
        'string.base': 'Color name must be a string.',
        'string.empty': 'Please provide a color name.',
        'any.required': 'Color name is required.',
    }),
    hexCode: Joi.string()
        .min(1)
        .pattern(/^#([0-9A-F]{3}){1,2}$/i)
        .required()
        .messages({
            'string.base': 'Hex code must be a string.',
            'string.empty': 'Please provide a hex code.',
            'string.pattern.base':
                'Please provide a valid hex code in the format #RRGGBB or #RGB.',
            'any.required': 'Hex code is required.',
        }),
})
export default colorValidationSchema
