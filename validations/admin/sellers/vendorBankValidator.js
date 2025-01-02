import Joi from 'joi'

const vendorBankValidationSchema = Joi.object({
    vendor: Joi.string().required().messages({
        'any.required': 'Please provide vendor ID.',
        'string.empty': 'Vendor ID cannot be empty.',
    }),
    holderName: Joi.string().required().messages({
        'any.required': 'Please provide holder name.',
        'string.empty': 'Holder name cannot be empty.',
    }),
    bankName: Joi.string().required().messages({
        'any.required': 'Please provide bank name.',
        'string.empty': 'Bank name cannot be empty.',
    }),
    branch: Joi.string().required().messages({
        'any.required': 'Please provide branch name.',
        'string.empty': 'Branch name cannot be empty.',
    }),
    accountNumber: Joi.string().required().messages({
        'any.required': 'Please provide account number.',
        'string.empty': 'Account number cannot be empty.',
    }),
})

export default vendorBankValidationSchema
