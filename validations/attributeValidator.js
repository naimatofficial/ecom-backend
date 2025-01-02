import Joi from 'joi'

// Ensure that the attribute name is unique (this is more of a validation concept,
// and uniqueness should ideally be enforced at the database level as well)

const attributeValidationSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            'any.required': 'Please provide attribute name.',
            'string.empty': 'Attribute name cannot be empty.',
        })
        .trim(),
})

export default attributeValidationSchema
