import Joi from 'joi';

const deliveryManValidationSchema = Joi.object({
    uploadPictureOnDelivery: Joi.string()
        .valid('active', 'inactive')
        .default('inactive')
        .required()
        .messages({
            'any.required': 'Please specify if uploading picture on delivery is active or inactive',
            'string.base': 'Upload picture on delivery status must be a string',
            'any.only': 'Upload picture on delivery status must be either active or inactive',
        }),
});

export default deliveryManValidationSchema;
