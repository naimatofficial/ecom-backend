import Joi from 'joi'

const featuredDealValidationSchema = Joi.object({
    title: Joi.string().required().messages({
        'any.required': 'Title is required',
        'string.base': 'Title must be a string',
        'string.empty': 'Title cannot be empty',
    }),
    startDate: Joi.date().required().messages({
        'any.required': 'Start date is required',
        'date.base': 'Start date must be a valid date',
    }),
    endDate: Joi.date().required().messages({
        'any.required': 'End date is required',
        'date.base': 'End date must be a valid date',
    }),
})

export default featuredDealValidationSchema
