import Joi from 'joi';

const businessGeneralValidationSchema = Joi.object({
    companyName: Joi.string().required().messages({
        'any.required': 'Company name is required',
        'string.base': 'Company name must be a string',
        'string.empty': 'Company name cannot be empty',
    }),
    phone: Joi.string().required().messages({
        'any.required': 'Phone number is required',
        'string.base': 'Phone number must be a string',
        'string.empty': 'Phone number cannot be empty',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Please provide your email address.',
        'string.email': 'Please provide a valid email address.',
        'string.base': 'Email must be a string',
    }),
    country: Joi.string().required().messages({
        'any.required': 'Country is required',
        'string.base': 'Country must be a string',
        'string.empty': 'Country cannot be empty',
    }),
    timezone: Joi.string().required().messages({
        'any.required': 'Timezone is required',
        'string.base': 'Timezone must be a string',
        'string.empty': 'Timezone cannot be empty',
    }),
    language: Joi.string().required().messages({
        'any.required': 'Language is required',
        'string.base': 'Language must be a string',
        'string.empty': 'Language cannot be empty',
    }),
    companyAddress: Joi.string().required().messages({
        'any.required': 'Company address is required',
        'string.base': 'Company address must be a string',
        'string.empty': 'Company address cannot be empty',
    }),
    latitude: Joi.number().required().messages({
        'any.required': 'Latitude is required',
        'number.base': 'Latitude must be a number',
    }),
    longitude: Joi.number().required().messages({
        'any.required': 'Longitude is required',
        'number.base': 'Longitude must be a number',
    }),
    currency: Joi.string().required().messages({
        'any.required': 'Currency is required',
        'string.base': 'Currency must be a string',
        'string.empty': 'Currency cannot be empty',
    }),
    currencyPosition: Joi.string().valid("Left", "Right").required().messages({
        'any.required': 'Currency position is required',
        'any.only': 'Currency position must be either "Left" or "Right"',
        'string.base': 'Currency position must be a string',
    }),
    forgotPasswordVerification: Joi.string().valid("Email", "OTP").required().messages({
        'any.required': 'Forgot password verification method is required',
        'any.only': 'Forgot password verification method must be either "Email" or "OTP"',
        'string.base': 'Forgot password verification method must be a string',
    }),
    businessModel: Joi.string().valid("Single Vendor", "Multi Vendor").required().messages({
        'any.required': 'Business model is required',
        'any.only': 'Business model must be either "Single Vendor" or "Multi Vendor"',
        'string.base': 'Business model must be a string',
    }),
    pagination: Joi.boolean().default(false),
    companyCopyrightText: Joi.string().required().messages({
        'any.required': 'Company copyright text is required',
        'string.base': 'Company copyright text must be a string',
        'string.empty': 'Company copyright text cannot be empty',
    }),
    appleStoreLink: Joi.string().required().messages({
        'any.required': 'Apple Store download link is required',
        'string.base': 'Apple Store download link must be a string',
        'string.empty': 'Apple Store download link cannot be empty',
    }),
    googlePlayStoreLink: Joi.string().required().messages({
        'any.required': 'Google Play Store download link is required',
        'string.base': 'Google Play Store download link must be a string',
        'string.empty': 'Google Play Store download link cannot be empty',
    }),
    primaryColor: Joi.string().required().messages({
        'any.required': 'Primary color is required',
        'string.base': 'Primary color must be a string',
        'string.empty': 'Primary color cannot be empty',
    }),
    secondaryColor: Joi.string().required().messages({
        'any.required': 'Secondary color is required',
        'string.base': 'Secondary color must be a string',
        'string.empty': 'Secondary color cannot be empty',
    }),
    headerLogo: Joi.string().required().messages({
        'any.required': 'Header logo is required',
        'string.base': 'Header logo must be a string',
        'string.empty': 'Header logo cannot be empty',
    }),
    footerLogo: Joi.string().required().messages({
        'any.required': 'Footer logo is required',
        'string.base': 'Footer logo must be a string',
        'string.empty': 'Footer logo cannot be empty',
    }),
    favicon: Joi.string().required().messages({
        'any.required': 'Favicon is required',
        'string.base': 'Favicon must be a string',
        'string.empty': 'Favicon cannot be empty',
    }),
    loadingGif: Joi.string().required().messages({
        'any.required': 'Loading GIF is required',
        'string.base': 'Loading GIF must be a string',
        'string.empty': 'Loading GIF cannot be empty',
    }),
    appLogo: Joi.string().required().messages({
        'any.required': 'App logo is required',
        'string.base': 'App logo must be a string',
        'string.empty': 'App logo cannot be empty',
    }),
});

export default businessGeneralValidationSchema;
